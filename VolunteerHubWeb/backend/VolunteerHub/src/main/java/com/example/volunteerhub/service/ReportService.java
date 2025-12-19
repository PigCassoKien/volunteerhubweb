package com.example.volunteerhub.service;

import com.example.volunteerhub.dto.EventReportDTO;
import com.example.volunteerhub.entity.Event;
import com.example.volunteerhub.entity.EventRegistration;
import com.example.volunteerhub.entity.Post;
import com.example.volunteerhub.entity.enums.RegistrationStatus;
import com.example.volunteerhub.repository.*;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.ss.util.CellRangeAddress;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.FileOutputStream;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

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

        List<EventRegistration> registrations = registrationRepository.findByEventId(eventId)
            .stream()
            .filter(r -> r.getStatus() == RegistrationStatus.APPROVED || r.getStatus() == RegistrationStatus.COMPLETED)
            .collect(Collectors.toList());

        Workbook workbook = new XSSFWorkbook();
        try {
            Sheet sheet = workbook.createSheet("Participants");

            // Styles
            Font titleFont = workbook.createFont();
            titleFont.setBold(true);
            titleFont.setFontHeightInPoints((short) 16);
            CellStyle titleStyle = workbook.createCellStyle();
            titleStyle.setFont(titleFont);
            titleStyle.setAlignment(HorizontalAlignment.LEFT);

            Font subFont = workbook.createFont();
            subFont.setFontHeightInPoints((short) 11);
            CellStyle subStyle = workbook.createCellStyle();
            subStyle.setFont(subFont);
            subStyle.setAlignment(HorizontalAlignment.LEFT);

            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerFont.setColor(IndexedColors.WHITE.getIndex());
            CellStyle headerStyle = workbook.createCellStyle();
            headerStyle.setFont(headerFont);
            headerStyle.setFillForegroundColor(IndexedColors.TEAL.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            headerStyle.setAlignment(HorizontalAlignment.CENTER);
            headerStyle.setVerticalAlignment(VerticalAlignment.CENTER);
            headerStyle.setBorderTop(BorderStyle.THIN);
            headerStyle.setBorderBottom(BorderStyle.THIN);
            headerStyle.setBorderLeft(BorderStyle.THIN);
            headerStyle.setBorderRight(BorderStyle.THIN);

            CellStyle wrapStyle = workbook.createCellStyle();
            wrapStyle.setWrapText(true);

            CreationHelper createHelper = workbook.getCreationHelper();
            CellStyle dateStyle = workbook.createCellStyle();
            short df = createHelper.createDataFormat().getFormat("yyyy-mm-dd HH:mm");
            dateStyle.setDataFormat(df);

            CellStyle linkStyle = workbook.createCellStyle();
            Font linkFont = workbook.createFont();
            linkFont.setColor(IndexedColors.BLUE.getIndex());
            linkFont.setUnderline(Font.U_SINGLE);
            linkStyle.setFont(linkFont);

            // Title
            int rowIdx = 0;
            Row titleRow = sheet.createRow(rowIdx++);
            Cell titleCell = titleRow.createCell(0);
            titleCell.setCellValue("Danh sách thành viên - " + (event.getTitle() == null ? "" : event.getTitle()));
            titleStyle.setAlignment(HorizontalAlignment.CENTER);
            titleCell.setCellStyle(titleStyle);
            // merge title across all header columns (set after headers determined below)

            // Event meta row
            Row metaRow = sheet.createRow(rowIdx++);
            metaRow.createCell(0).setCellValue("Địa điểm: " + (event.getLocation() == null ? "" : event.getLocation()));
            metaRow.createCell(2).setCellValue("Thời gian: " + (event.getStartDate() == null ? "" : event.getStartDate().toString()));
            metaRow.getCell(0).setCellStyle(subStyle);
            metaRow.getCell(2).setCellStyle(subStyle);

            // Empty spacer
            rowIdx++;

            // Header
            Row header = sheet.createRow(rowIdx++);
            String[] headers = new String[] {
                    "STT", "Họ và tên", "Email", "Số điện thoại", "Ngày đăng ký",
                    "Trạng thái", "URL chứng nhận", "Ngày sinh", "Địa chỉ", "Nghề nghiệp", "Kỹ năng", "Kinh nghiệm"
            };
            for (int i = 0; i < headers.length; i++) {
                Cell c = header.createCell(i);
                c.setCellValue(headers[i]);
                c.setCellStyle(headerStyle);
            }

            // Now that headers exist, merge title across header width
            sheet.addMergedRegion(new CellRangeAddress(0, 0, 0, headers.length - 1));
            // enable autofilter on header row
            sheet.setAutoFilter(new CellRangeAddress(header.getRowNum(), header.getRowNum(), 0, headers.length - 1));

            // Data cell styles (borders, alignment)
            CellStyle dataStyle = workbook.createCellStyle();
            dataStyle.setBorderTop(BorderStyle.THIN);
            dataStyle.setBorderBottom(BorderStyle.THIN);
            dataStyle.setBorderLeft(BorderStyle.THIN);
            dataStyle.setBorderRight(BorderStyle.THIN);
            dataStyle.setVerticalAlignment(VerticalAlignment.CENTER);
            dataStyle.setWrapText(false);

            CellStyle zebraStyle = workbook.createCellStyle();
            zebraStyle.cloneStyleFrom(dataStyle);
            zebraStyle.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
            zebraStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);

            // ensure dateStyle has borders and vertical alignment
            dateStyle.setBorderTop(BorderStyle.THIN);
            dateStyle.setBorderBottom(BorderStyle.THIN);
            dateStyle.setBorderLeft(BorderStyle.THIN);
            dateStyle.setBorderRight(BorderStyle.THIN);
            dateStyle.setVerticalAlignment(VerticalAlignment.CENTER);

            // Content rows with zebra striping
            int idx = 1;
            for (EventRegistration r : registrations) {
                Row row = sheet.createRow(rowIdx++);
                boolean odd = (idx % 2 == 1);

                Cell c0 = row.createCell(0);
                c0.setCellValue(idx);
                c0.setCellStyle(odd ? zebraStyle : dataStyle);

                Cell c1 = row.createCell(1);
                c1.setCellValue(r.getFullName() == null ? "" : r.getFullName());
                c1.setCellStyle(odd ? zebraStyle : dataStyle);

                Cell c2 = row.createCell(2);
                c2.setCellValue(r.getContactEmail() == null ? "" : r.getContactEmail());
                c2.setCellStyle(odd ? zebraStyle : dataStyle);

                Cell c3 = row.createCell(3);
                c3.setCellValue(r.getPhone() == null ? "" : r.getPhone());
                c3.setCellStyle(odd ? zebraStyle : dataStyle);

                Cell regAtCell = row.createCell(4);
                if (r.getRegisteredAt() != null) {
                    regAtCell.setCellValue(r.getRegisteredAt());
                    regAtCell.setCellStyle(dateStyle);
                } else {
                    regAtCell.setCellValue("");
                    regAtCell.setCellStyle(odd ? zebraStyle : dataStyle);
                }

                Cell c5 = row.createCell(5);
                c5.setCellValue(r.getStatus() == null ? "" : r.getStatus().name());
                c5.setCellStyle(odd ? zebraStyle : dataStyle);

                // certificate URL (if any) - leave empty for now
                Cell certCell = row.createCell(6);
                certCell.setCellValue("");
                certCell.setCellStyle(odd ? zebraStyle : dataStyle);

                Cell c7 = row.createCell(7);
                c7.setCellValue(r.getDateOfBirth() == null ? "" : r.getDateOfBirth().toString());
                c7.setCellStyle(odd ? zebraStyle : dataStyle);

                Cell c8 = row.createCell(8);
                c8.setCellValue(r.getAddress() == null ? "" : r.getAddress());
                c8.setCellStyle(odd ? zebraStyle : dataStyle);

                Cell c9 = row.createCell(9);
                c9.setCellValue(r.getOccupation() == null ? "" : r.getOccupation());
                c9.setCellStyle(odd ? zebraStyle : dataStyle);

                Cell c10 = row.createCell(10);
                c10.setCellValue(r.getSkills() == null ? "" : r.getSkills());
                c10.setCellStyle(odd ? zebraStyle : dataStyle);

                Cell c11 = row.createCell(11);
                c11.setCellValue(r.getExperience() == null ? "" : r.getExperience());
                c11.setCellStyle(odd ? zebraStyle : dataStyle);

                idx++;
            }

            // Freeze header row (title/meta rows above header -> freeze at header.getRowNum()+1)
            sheet.createFreezePane(0, header.getRowNum() + 1);

            // Adjust column widths (sensible defaults)
            int[] widths = new int[] { 6, 30, 28, 16, 20, 14, 40, 14, 40, 20, 30, 40 };
            for (int i = 0; i < widths.length; i++) {
                sheet.setColumnWidth(i, widths[i] * 256);
            }

            // Auto-size some important columns for neatness
            sheet.autoSizeColumn(1);
            sheet.autoSizeColumn(2);
            sheet.autoSizeColumn(6);

            // Print setup: fit to width, landscape for readability
            sheet.getPrintSetup().setLandscape(true);
            sheet.setFitToPage(true);
            sheet.getPrintSetup().setFitWidth((short) 1);
            sheet.getPrintSetup().setFitHeight((short) 0);

            // create temp file
            File tmp = File.createTempFile("participants_event_" + eventId + "_", ".xlsx");
            try (FileOutputStream fos = new FileOutputStream(tmp)) {
                workbook.write(fos);
            }

            return tmp;
        } catch (Exception e) {
            throw new RuntimeException("Failed to export participants: " + e.getMessage(), e);
        } finally {
            try {
                workbook.close();
            } catch (Exception ignore) {}
        }
    }

}
