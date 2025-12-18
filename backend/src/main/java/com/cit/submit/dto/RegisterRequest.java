package com.cit.submit.dto;

public class RegisterRequest {
    private String email;
    private String password;
    private String name;
    private String studentId;
    private String teamCode;

    public RegisterRequest() {}

    public RegisterRequest(String email, String password, String name, String studentId, String teamCode) {
        this.email = email;
        this.password = password;
        this.name = name;
        this.studentId = studentId;
        this.teamCode = teamCode;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getStudentId() {
        return studentId;
    }

    public void setStudentId(String studentId) {
        this.studentId = studentId;
    }

    public String getTeamCode() {
        return teamCode;
    }

    public void setTeamCode(String teamCode) {
        this.teamCode = teamCode;
    }
}
   
