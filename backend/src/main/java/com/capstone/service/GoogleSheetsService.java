package com.capstone.service;

import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.json.JsonFactory;
import com.google.api.client.json.jackson2.JacksonFactory;
import com.google.api.services.sheets.v4.Sheets;
import com.google.api.services.sheets.v4.model.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.security.GeneralSecurityException;
import java.util.Arrays;
import java.util.List;

@Slf4j
@Service
public class GoogleSheetsService {

    private static final String APPLICATION_NAME = "Capstone Deliverable Tracker";
    private static final JsonFactory JSON_FACTORY = JacksonFactory.getDefaultInstance();

    @Value("${google.sheets.api.key}")
    private String apiKey;

    @Value("${google.sheets.credentials.path:}")
    private String credentialsPath;

    /**
     * Create a new Google Sheet for a project
     */
    public String createSheet(String projectName) {
        try {
            Sheets service = getSheetsService();
            
            Spreadsheet spreadsheet = new Spreadsheet()
                    .setProperties(new SpreadsheetProperties()
                            .setTitle(projectName + " - Deliverables Tracker"));
            
            Spreadsheet createdSheet = service.spreadsheets().create(spreadsheet)
                    .setFields("spreadsheetId")
                    .execute();
            
            String sheetId = createdSheet.getSpreadsheetId();
            log.info("Created Google Sheet with ID: {}", sheetId);
            
            // Initialize headers
            initializeSheetHeaders(service, sheetId);
            
            return sheetId;
        } catch (Exception e) {
            log.error("Error creating Google Sheet", e);
            throw new RuntimeException("Failed to create Google Sheet", e);
        }
    }

    /**
     * Initialize sheet with headers
     */
    private void initializeSheetHeaders(Sheets service, String spreadsheetId) throws IOException {
        List<List<Object>> values = Arrays.asList(
                Arrays.asList(
                        "Deliverable Name",
                        "Project",
                        "Start Date",
                        "Due Date",
                        "Status",
                        "Progress %",
                        "Assigned Team",
                        "Priority",
                        "Last Updated"
                )
        );

        ValueRange body = new ValueRange()
                .setValues(values);

        service.spreadsheets().values()
                .update(spreadsheetId, "Sheet1!A1:I1", body)
                .setValueInputOption("RAW")
                .execute();

        log.info("Initialized sheet headers for spreadsheet: {}", spreadsheetId);
    }

    /**
     * Add deliverable row to Google Sheet
     */
    public void addDeliverableRow(String spreadsheetId, List<Object> rowData) {
        try {
            Sheets service = getSheetsService();
            
            ValueRange body = new ValueRange()
                    .setValues(Arrays.asList(rowData));

            AppendValuesResponse response = service.spreadsheets().values()
                    .append(spreadsheetId, "Sheet1!A:I", body)
                    .setValueInputOption("RAW")
                    .setInsertDataOption("INSERT_ROWS")
                    .execute();

            log.info("Added row to sheet. Updates: {}", response.getUpdates());
        } catch (Exception e) {
            log.error("Error adding deliverable row to Google Sheet", e);
        }
    }

    /**
     * Update deliverable row in Google Sheet
     */
    public void updateDeliverableRow(String spreadsheetId, String range, List<Object> rowData) {
        try {
            Sheets service = getSheetsService();
            
            ValueRange body = new ValueRange()
                    .setValues(Arrays.asList(rowData));

            service.spreadsheets().values()
                    .update(spreadsheetId, range, body)
                    .setValueInputOption("RAW")
                    .execute();

            log.info("Updated row in sheet at range: {}", range);
        } catch (Exception e) {
            log.error("Error updating deliverable row in Google Sheet", e);
        }
    }

    /**
     * Read data from Google Sheet
     */
    public List<List<Object>> readSheetData(String spreadsheetId, String range) {
        try {
            Sheets service = getSheetsService();
            
            ValueRange response = service.spreadsheets().values()
                    .get(spreadsheetId, range)
                    .execute();

            return response.getValues();
        } catch (Exception e) {
            log.error("Error reading Google Sheet", e);
            return Arrays.asList();
        }
    }

    /**
     * Get Sheets service instance
     */
    private Sheets getSheetsService() throws GeneralSecurityException, IOException {
        return new Sheets.Builder(
                GoogleNetHttpTransport.newTrustedTransport(),
                JSON_FACTORY,
                request -> {
                    // Add API key for authentication
                    if (apiKey != null && !apiKey.isEmpty()) {
                        request.getUrl().set("key", apiKey);
                    }
                })
                .setApplicationName(APPLICATION_NAME)
                .build();
    }
}
