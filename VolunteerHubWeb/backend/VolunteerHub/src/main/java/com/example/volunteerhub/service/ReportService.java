package com.example.volunteerhub.service;

import com.example.volunteerhub.dto.EventReportDTO;
import com.example.volunteerhub.entity.Event;
import com.example.volunteerhub.entity.EventRegistration;
import com.example.volunteerhub.entity.Post;
import com.example.volunteerhub.entity.enums.RegistrationStatus;
import com.example.volunteerhub.repository.*;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.FileOutputStream;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class ReportService {

    @Autowired
    private EventRegistrationRepository registrationRepository;

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private ReactionRepository reactionRepository;

    @Autowired
    private CommentRepository commentRepository;

    @Autowired
    private PostRepository postRepository;

    public EventReportDTO getEventReport(Long eventId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found"));

        EventReportDTO report = new EventReportDTO();
        report.setEventId(eventId);
        report.setEventTitle(event.getTitle());

        // Prefer count queries to avoid loading large collections into memory
        report.setTotalParticipants((int) registrationRepository.countByEventId(eventId));
        report.setApprovedParticipants((int) registrationRepository.countByEventIdAndStatus(eventId, RegistrationStatus.APPROVED));
        report.setTotalPosts((int) postRepository.countByEventId(eventId));

        return report;
    }

    // java
    public File exportParticipants(Long eventId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found"));

        List<EventRegistration> registrations = registrationRepository.findByEventIdAndStatus(eventId, RegistrationStatus.APPROVED);

        Workbook workbook = new XSSFWorkbook();
        try {
            Sheet sheet = workbook.createSheet("Participants");

            // Styles
            Font titleFont = workbook.createFont();
            titleFont.setBold(true);
            titleFont.setFontHeightInPoints((short) 14);
            CellStyle titleStyle = workbook.createCellStyle();
            titleStyle.setFont(titleFont);
            titleStyle.setAlignment(org.apache.poi.ss.usermodel.HorizontalAlignment.LEFT);

            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            CellStyle headerStyle = workbook.createCellStyle();
            headerStyle.setFont(headerFont);
            headerStyle.setAlignment(org.apache.poi.ss.usermodel.HorizontalAlignment.CENTER);
            headerStyle.setVerticalAlignment(org.apache.poi.ss.usermodel.VerticalAlignment.CENTER);

            CellStyle wrapStyle = workbook.createCellStyle();
            wrapStyle.setWrapText(true);

            CreationHelper createHelper = workbook.getCreationHelper();
            CellStyle dateStyle = workbook.createCellStyle();
            short df = createHelper.createDataFormat().getFormat("yyyy-mm-dd HH:mm");
            dateStyle.setDataFormat(df);

            // Title
            Row titleRow = sheet.createRow(0);
            Cell titleCell = titleRow.createCell(0);
            titleCell.setCellValue("Event Participants Report");
            titleCell.setCellStyle(titleStyle);
            sheet.addMergedRegion(new org.apache.poi.ss.util.CellRangeAddress(0, 0, 0, 5));

            // Blank row
            sheet.createRow(1);

            // Event info section
            int r = 2;
            Row rowEvent = sheet.createRow(r++);
            rowEvent.createCell(0).setCellValue("Event:");
            Cell evCell = rowEvent.createCell(1);
            evCell.setCellValue(event.getTitle() != null ? event.getTitle() : "");
            sheet.addMergedRegion(new org.apache.poi.ss.util.CellRangeAddress(2, 2, 1, 5));

            Row rowDesc = sheet.createRow(r++);
            rowDesc.createCell(0).setCellValue("Description:");
            Cell descCell = rowDesc.createCell(1);
            String desc = null;
            try { desc = event.getDescription(); } catch (Exception ignored) {}
            descCell.setCellValue(desc != null ? desc : "");
            descCell.setCellStyle(wrapStyle);
            // merge description across multiple columns/rows for nicer layout
            sheet.addMergedRegion(new org.apache.poi.ss.util.CellRangeAddress(3, 4, 1, 5));
            r++; // account for merged row

            Row rowDates = sheet.createRow(r++);
            rowDates.createCell(0).setCellValue("Start Date:");
            org.apache.poi.ss.usermodel.Cell startCell = rowDates.createCell(1);
            try {
                java.time.LocalDateTime sd = event.getStartDate();
                if (sd != null) {
                    startCell.setCellValue(java.sql.Timestamp.valueOf(sd));
                    startCell.setCellStyle(dateStyle);
                } else {
                    startCell.setCellValue("");
                }
            } catch (Exception ignored) {
                startCell.setCellValue("");
            }

            rowDates.createCell(2).setCellValue("End Date:");
            org.apache.poi.ss.usermodel.Cell endCell = rowDates.createCell(3);
            try {
                java.time.LocalDateTime ed = event.getEndDate();
                if (ed != null) {
                    endCell.setCellValue(java.sql.Timestamp.valueOf(ed));
                    endCell.setCellStyle(dateStyle);
                } else {
                    endCell.setCellValue("");
                }
            } catch (Exception ignored) {
                endCell.setCellValue("");
            }

            Row rowLoc = sheet.createRow(r++);
            rowLoc.createCell(0).setCellValue("Location:");
            org.apache.poi.ss.usermodel.Cell locCell = rowLoc.createCell(1);
            try {
                String loc = event.getLocation();
                locCell.setCellValue(loc != null ? loc : "");
            } catch (Exception ignored) {
                locCell.setCellValue("");
            }
            sheet.addMergedRegion(new org.apache.poi.ss.util.CellRangeAddress(r - 1, r - 1, 1, 5));

            // Blank row before table
            sheet.createRow(r++);

            // Table header
            Row header = sheet.createRow(r++);
            String[] cols = {"ID", "Full Name", "Email", "Phone Number", "Joined At", "Status"};
            for (int i = 0; i < cols.length; i++) {
                org.apache.poi.ss.usermodel.Cell c = header.createCell(i);
                c.setCellValue(cols[i]);
                c.setCellStyle(headerStyle);
            }

            // Table rows
            int rowNum = r;
            for (EventRegistration reg : registrations) {
                Row row = sheet.createRow(rowNum++);
                long userId = 0;
                String fullName = "";
                String email = "";
                String phone = "";
                try {
                    if (reg.getUser() != null) {
                        if (reg.getUser().getId() != null) userId = reg.getUser().getId();
                        fullName = reg.getUser().getFullName() != null ? reg.getUser().getFullName() : "";
                        email = reg.getUser().getEmail() != null ? reg.getUser().getEmail() : "";
                        phone = reg.getUser().getPhoneNumber() != null ? reg.getUser().getPhoneNumber() : "";
                    }
                } catch (Exception ignored) {}

                row.createCell(0).setCellValue(userId);
                row.createCell(1).setCellValue(fullName);
                row.createCell(2).setCellValue(email);
                row.createCell(3).setCellValue(phone);

                // Joined At - try common field names, fall back to empty string
                Cell joinedCell = row.createCell(4);
                try {
                    LocalDateTime joined = null;
                    try { joined = reg.getRegisteredAt(); } catch (Throwable ignored) {}
                    if (joined == null) {
                        try { joined = reg.getRegisteredAt(); } catch (Throwable ignored) {}
                    }
                    if (joined != null) {
                        joinedCell.setCellValue(java.sql.Timestamp.valueOf(joined));
                        joinedCell.setCellStyle(dateStyle);
                    } else {
                        joinedCell.setCellValue("");
                    }
                } catch (Exception ignored) {
                    joinedCell.setCellValue("");
                }

                // Status
                String status = "";
                try { status = reg.getStatus() != null ? reg.getStatus().name() : ""; } catch (Exception ignored) {}
                row.createCell(5).setCellValue(status);
            }

            // Auto-size columns
            for (int i = 0; i < cols.length; i++) {
                sheet.autoSizeColumn(i);
                // enforce a minimum width for better readability
                int current = sheet.getColumnWidth(i);
                int min = 3000;
                if (current < min) sheet.setColumnWidth(i, min);
            }

            String filePath = "./Uploads/reports/event_" + eventId + "_participants.xlsx";
            File file = new File(filePath);
            file.getParentFile().mkdirs();
            try (FileOutputStream fileOut = new FileOutputStream(file)) {
                workbook.write(fileOut);
            }
            return file;
        } catch (Exception e) {
            throw new RuntimeException("Failed to export participants", e);
        } finally {
            try {
                workbook.close();
            } catch (Exception ignored) {}
        }
    }

}
