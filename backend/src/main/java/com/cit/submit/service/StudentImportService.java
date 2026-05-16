package com.cit.submit.service;

import com.cit.submit.dto.StudentImportResponse;
import com.cit.submit.model.StudentImport;
import com.cit.submit.model.User;
import com.cit.submit.repository.StudentImportRepository;
import com.cit.submit.repository.UserRepository;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class StudentImportService {

    @Autowired
    private StudentImportRepository studentImportRepository;

    @Autowired
    private UserRepository userRepository;

    /**
     * Parse Excel file and import student data
     * Expected columns: Email, Team Code, Student Name (optional), Student ID (optional)
     */
    public Map<String, Object> importStudentsFromExcel(MultipartFile file, Long userId) throws Exception {
        // Verify user is admin
        User admin = userRepository.findById(userId)
                .orElseThrow(() -> new Exception("Admin user not found"));

        if (!admin.getRole().toString().equals("ADMIN")) {
            throw new Exception("Only admins can import students");
        }

        List<StudentImport> importedStudents = new ArrayList<>();
        List<String> errors = new ArrayList<>();
        String importBatchId = UUID.randomUUID().toString();

        try (Workbook workbook = new XSSFWorkbook(file.getInputStream())) {
            Sheet sheet = workbook.getSheetAt(0);

            // Find header row
            Row headerRow = sheet.getRow(0);
            if (headerRow == null) {
                throw new Exception("No data found in Excel file");
            }

            int emailCol = findColumnIndex(headerRow, new String[]{"email", "student email", "email address"});
            int teamCol = findColumnIndex(headerRow, new String[]{"team", "team code", "team name"});
            int nameCol = findColumnIndex(headerRow, new String[]{"name", "student name", "full name"});
            int studentIdCol = findColumnIndex(headerRow, new String[]{"student id", "id", "student number"});

            if (emailCol == -1 || teamCol == -1) {
                throw new Exception("Excel file must contain 'Email' and 'Team Code' columns");
            }

            // Process data rows
            for (int i = 1; i <= sheet.getLastRowNum(); i++) {
                Row row = sheet.getRow(i);
                if (row == null) continue;

                try {
                    String email = getCellStringValue(row.getCell(emailCol)).trim();
                    String teamCode = getCellStringValue(row.getCell(teamCol)).trim();
                    String studentName = nameCol != -1 ? getCellStringValue(row.getCell(nameCol)).trim() : "";
                    String studentId = studentIdCol != -1 ? getCellStringValue(row.getCell(studentIdCol)).trim() : "";

                    // Validate email
                    if (email.isEmpty()) {
                        errors.add("Row " + (i + 1) + ": Email is required");
                        continue;
                    }

                    // Validate team code
                    if (teamCode.isEmpty()) {
                        errors.add("Row " + (i + 1) + ": Team code is required");
                        continue;
                    }

                    // Check for duplicates in import
                    if (importedStudents.stream().anyMatch(s -> s.getEmail().equalsIgnoreCase(email))) {
                        errors.add("Row " + (i + 1) + ": Duplicate email in file: " + email);
                        continue;
                    }

                    // Check if email already imported
                    if (studentImportRepository.existsByEmail(email)) {
                        errors.add("Row " + (i + 1) + ": Email already imported: " + email);
                        continue;
                    }

                    StudentImport studentImport = new StudentImport();
                    studentImport.setEmail(email.toLowerCase());
                    studentImport.setTeamCode(teamCode);
                    studentImport.setStudentName(studentName.isEmpty() ? null : studentName);
                    studentImport.setStudentId(studentId.isEmpty() ? null : studentId);
                    studentImport.setImportedByUser(admin);
                    studentImport.setImportBatchId(importBatchId);

                    importedStudents.add(studentImport);
                } catch (Exception e) {
                    errors.add("Row " + (i + 1) + ": " + e.getMessage());
                }
            }

            // Save all imported students
            if (!importedStudents.isEmpty()) {
                studentImportRepository.saveAll(importedStudents);
            }

        } catch (IOException e) {
            throw new Exception("Error reading Excel file: " + e.getMessage());
        }

        Map<String, Object> result = new HashMap<>();
        result.put("importBatchId", importBatchId);
        result.put("successCount", importedStudents.size());
        result.put("errorCount", errors.size());
        result.put("errors", errors);
        result.put("importedStudents", importedStudents.stream()
                .map(StudentImportResponse::new)
                .collect(Collectors.toList()));

        return result;
    }

    /**
     * Get all imported students for an admin
     */
    public List<StudentImportResponse> getImportedStudents(Long userId) throws Exception {
        User admin = userRepository.findById(userId)
                .orElseThrow(() -> new Exception("User not found"));

        if (!admin.getRole().toString().equals("ADMIN")) {
            throw new Exception("Only admins can view imported students");
        }

        return studentImportRepository.findByImportedByUserId(userId).stream()
                .map(StudentImportResponse::new)
                .collect(Collectors.toList());
    }

    /**
     * Get students from a specific import batch
     */
    public List<StudentImportResponse> getImportBatch(String batchId, Long userId) throws Exception {
        User admin = userRepository.findById(userId)
                .orElseThrow(() -> new Exception("User not found"));

        if (!admin.getRole().toString().equals("ADMIN")) {
            throw new Exception("Only admins can view import batches");
        }

        return studentImportRepository.findByImportBatchId(batchId).stream()
                .map(StudentImportResponse::new)
                .collect(Collectors.toList());
    }

    /**
     * Get student import by email (used during OAuth registration)
     */
    public StudentImportResponse getStudentByEmail(String email) throws Exception {
        Optional<StudentImport> student = studentImportRepository.findByEmail(email.toLowerCase());
        if (student.isPresent()) {
            return new StudentImportResponse(student.get());
        }
        return null;
    }

    /**
     * Mark student as registered
     */
    public void markStudentAsRegistered(String email) throws Exception {
        Optional<StudentImport> student = studentImportRepository.findByEmail(email.toLowerCase());
        if (student.isPresent()) {
            StudentImport s = student.get();
            s.setIsRegistered(true);
            studentImportRepository.save(s);
        }
    }

    /**
     * Delete a batch of imported students
     */
    public void deleteImportBatch(String batchId, Long userId) throws Exception {
        User admin = userRepository.findById(userId)
                .orElseThrow(() -> new Exception("User not found"));

        if (!admin.getRole().toString().equals("ADMIN")) {
            throw new Exception("Only admins can delete import batches");
        }

        List<StudentImport> batch = studentImportRepository.findByImportBatchId(batchId);
        studentImportRepository.deleteAll(batch);
    }

    /**
     * Delete a single imported student
     */
    public void deleteStudent(Long studentImportId, Long userId) throws Exception {
        User admin = userRepository.findById(userId)
                .orElseThrow(() -> new Exception("User not found"));

        if (!admin.getRole().toString().equals("ADMIN")) {
            throw new Exception("Only admins can delete imported students");
        }

        studentImportRepository.deleteById(studentImportId);
    }

    /**
     * Helper method to find column index by header names
     */
    private int findColumnIndex(Row headerRow, String[] possibleNames) {
        for (int i = 0; i < headerRow.getLastCellNum(); i++) {
            String cellValue = getCellStringValue(headerRow.getCell(i)).toLowerCase().trim();
            for (String name : possibleNames) {
                if (cellValue.equalsIgnoreCase(name)) {
                    return i;
                }
            }
        }
        return -1;
    }

    /**
     * Helper method to safely get string value from cell
     */
    private String getCellStringValue(Cell cell) {
        if (cell == null) {
            return "";
        }

        switch (cell.getCellType()) {
            case STRING:
                return cell.getStringCellValue();
            case NUMERIC:
                return String.valueOf((int) cell.getNumericCellValue());
            case BOOLEAN:
                return String.valueOf(cell.getBooleanCellValue());
            default:
                return "";
        }
    }
}
