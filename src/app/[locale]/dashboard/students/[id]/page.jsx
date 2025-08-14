"use client";

import React from "react";
import { useParams } from "next/navigation";
import Image from "next/image";

export default function StudentReportPage() {
  const params = useParams();
  const id = params.id;

  const reportData = {
    order: 34,
    studentName: "أحمد محمد",
    stage: "ثاني متوسط",
    preservation: { expected: 27, achieved: 10, diff: -17, percentage: 37 },
    majorReview: { expected: 160, achieved: 149, diff: -11, percentage: 93.1 },
    minorReview: { expected: 77, achieved: 48.5, diff: -28.5, percentage: 63 },
    attendance: { expected: 50, absent: 4, late: 0, present: 46, percentage: 92 },
    starTimes: 2,
    scorePercent: 71.3,
    grade: "جيد",
    lastAction: "أشعار",
    prayerText:
      "اللهم اجعله باراً بوالديه، واجعله قرة عين لهما، وبارك لهما فيه، وزد في علمه وعمره،",
  };

  const cellStyle = {
    border: "1px solid #0B7459",
    textAlign: "center",
    padding: "8px 12px",
    fontSize: "14px",
  };

  const infoCardStyle = {
    border: "2px solid #0B7459",
    borderRadius: "0 0 20px 20px",
    padding: "12px 25px",
    minWidth: "130px",
    textAlign: "center",
    fontWeight: "bold",
    color: "#0B7459",
    boxShadow: "0 2px 8px rgba(11, 116, 89, 0.25)",
    backgroundColor: "#E6F4F1",
  };

  return (
    <>
      <style jsx global>{`
        @media print {
          body {
            margin: 0;
            padding: 0;
            width: 210mm;
            height: 280mm;
            box-sizing: border-box;
          }
          .report-container {
            width: 210mm;
            height: 280mm;
            margin: 0;
            padding: 10mm; /* Reduced padding for print to fit content */
            box-sizing: border-box;
            position: relative;
            overflow: hidden;
            background: #fff;
            box-shadow: none;
            z-index: 1;
            transform: translateY(-20mm);
          }
          .report-container * {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .background-image {
            position: absolute;
            inset: 0;
            width: 100%;
            height: 100%;
          }
          .content {
            position: relative;
            z-index: 1;
            width: 80%;
            height: 100%;
            margin: 0 auto;
            padding-left: 0;
            padding-right: 0;
          }
          table, .info-cards, .order-box, h2, p {
            page-break-inside: avoid;
          }
          .order-box {
            font-size: 20px; /* Slightly smaller for print */
            padding: 6px 16px;
            min-width: 120px;
          }
          h2 {
            font-size: 20px; /* Adjusted for print */
          }
          .info-cards {
            gap: 10px;
            margin-top: 20px;
          }
          .info-card {
            font-size: 12px; /* Adjusted for print */
            min-width: 100px;
            padding: 8px 16px;
          }
          .info-card > div:last-child {
            font-size: 24px;
          }
          @page {
            size: A4;
            margin: 0;
          }
        }
        /* Responsive screen styles */
        .report-container {
          position: relative;
          overflow: hidden;
          max-width: 100%;
          width: 100%;
          margin: 20px auto;
          padding: 16px;
        }
        @media screen and (min-width: 640px) {
          .report-container {
            max-width: 600px;
            padding: 24px;
          }
        }
        @media screen and (min-width: 900px) {
          .report-container {
            max-width: 900px;
          }
        }
      `}</style>
      <div
        dir="rtl"
        className="report-container"
        style={{
          boxShadow: "0 0 20px rgba(11, 116, 89, 0.15)",
          background: "#fff",
          fontFamily: `"Amiri", "Tahoma", Arial, "Segoe UI", sans-serif`,
          fontSize: "15px",
          color: "#333",
          borderRadius: "12px",
        }}
      >
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src="/Artboard 3-100.jpg"
            fill
            alt="خلفية التقرير"
            className="background-image w-full h-full"
            onError={() => console.error("Failed to load background image")}
          />
        </div>

        {/* Content Wrapper */}
        <div className="content relative z-1 px-20">
          {/* شعار الجامعة */}
          <div style={{ textAlign: "center", marginBottom: "15px" }}>
            <Image
              src="/logo.png"
              width={80}
              height={80}
              alt="شعار الجامعة"
              className="mx-auto"
              onError={() => console.error("Failed to load logo image")}
            />
          </div>

          {/* الترتيب على المرحلة */}
          <div
            className="order-box"
            style={{
              float: "left",
              border: "1px solid #0B7459",
              borderRadius: "8px",
              padding: "8px 24px",
              color: "#0B7459",
              fontWeight: "bold",
              fontSize: "24px",
              direction: "rtl",
              boxShadow: "0 2px 6px rgba(11, 116, 89, 0.5)",
              backgroundColor: "#E6F4F1",
              minWidth: "140px",
            }}
          >
            <div>الترتيب على المرحلة</div>
            <div style={{ marginTop: "6px" }}>{reportData.order}</div>
          </div>

          {/* عنوان التقرير */}
          <h2
            style={{
              textAlign: "center",
              fontWeight: "bold",
              marginTop: 0,
              marginBottom: "25px",
              color: "#0B7459",
              fontSize: "24px",
              letterSpacing: "0.05em",
              borderBottom: "2px solid #0B7459",
              paddingBottom: "10px",
            }}
          >
            التقرير الختامي للفصل الثاني 1446هـ
          </h2>

          {/* اسم الطالب والمرحلة */}
          <p style={{ marginTop: 0, marginBottom: "20px", fontSize: "17px" }}>
            الطالب : <strong>{reportData.studentName}</strong>
            {"  "} المرحلة : <strong>{reportData.stage}</strong>
          </p>

          {/* جداول التقارير */}
          {["preservation", "majorReview", "minorReview"].map((key) => {
            const title = {
              preservation: "الحفظ",
              majorReview: "المراجعة الكبرى",
              minorReview: "المراجعة الصغرى",
            };
            return (
              <table
                key={key}
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  backgroundColor: "#E6F4F1",
                  marginBottom: "15px",
                  borderRadius: "6px",
                  overflow: "hidden",
                }}
              >
                <thead style={{ backgroundColor: "#084D3E" }}>
                  <tr>
                    <th style={{ ...cellStyle, fontWeight: "bold", color: "#fff" }}>
                      المفترض
                    </th>
                    <th style={{ ...cellStyle, fontWeight: "bold", color: "#fff" }}>
                      المنجز
                    </th>
                    <th style={{ ...cellStyle, fontWeight: "bold", color: "#fff" }}>
                      الإضافي (+) | العجز (-)
                    </th>
                    <th style={{ ...cellStyle, fontWeight: "bold", color: "#fff" }}>
                      النسبة
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={cellStyle}>{reportData[key].expected}</td>
                    <td style={cellStyle}>{reportData[key].achieved}</td>
                    <td style={cellStyle}>{reportData[key].diff}</td>
                    <td style={cellStyle}>{reportData[key].percentage} %</td>
                  </tr>
                </tbody>
                <caption
                  style={{
                    textAlign: "center",
                    fontWeight: "bold",
                    marginTop: "6px",
                    fontSize: "16px",
                    color: "#0B7459",
                    paddingBottom: "6px",
                  }}
                >
                  {title[key]}
                </caption>
              </table>
            );
          })}

          {/* جدول الحضور */}
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              backgroundColor: "#E6F4F1",
              marginBottom: "20px",
              borderRadius: "6px",
              overflow: "hidden",
              boxShadow: "inset 0 0 5px rgba(11, 116, 89, 0.2)",
            }}
          >
            <thead style={{ backgroundColor: "#084D3E" }}>
              <tr>
                <th style={{ ...cellStyle, fontWeight: "bold", color: "#fff" }}>
                  المفترض
                </th>
                <th style={{ ...cellStyle, fontWeight: "bold", color: "#fff" }}>
                  أيام الغياب
                </th>
                <th style={{ ...cellStyle, fontWeight: "bold", color: "#fff" }}>
                  أيام التأخير
                </th>
                <th style={{ ...cellStyle, fontWeight: "bold", color: "#fff" }}>
                  أيام الحضور
                </th>
                <th style={{ ...cellStyle, fontWeight: "bold", color: "#fff" }}>
                  النسبة
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={cellStyle}>{reportData.attendance.expected}</td>
                <td style={cellStyle}>{reportData.attendance.absent}</td>
                <td style={cellStyle}>{reportData.attendance.late}</td>
                <td style={cellStyle}>{reportData.attendance.present}</td>
                <td style={cellStyle}>{reportData.attendance.percentage} %</td>
              </tr>
            </tbody>
          </table>

          {/* الكروت في الأسفل */}
          <div
            className="info-cards"
            style={{
              display: "flex",
              justifyContent: "space-around",
              marginTop: "30px",
              gap: "15px",
              flexWrap: "wrap",
            }}
          >
            <div style={infoCardStyle} className="info-card">
              <div style={{ fontSize: "14px" }}>عدد مرات نجم الحلقة</div>
              <div style={{ fontSize: "28px", marginTop: "6px" }}>
                {reportData.starTimes}
              </div>
            </div>
            <div style={infoCardStyle} className="info-card">
              <div style={{ fontSize: "14px" }}>النسبة</div>
              <div style={{ fontSize: "28px", marginTop: "6px" }}>
                {reportData.scorePercent} %
              </div>
            </div>
            <div style={infoCardStyle} className="info-card">
              <div style={{ fontSize: "14px" }}>التقدير</div>
              <div style={{ fontSize: "28px", marginTop: "6px" }}>
                {reportData.grade}
              </div>
            </div>
            <div style={infoCardStyle} className="info-card">
              <div style={{ fontSize: "14px" }}>آخر إجراء</div>
              <div style={{ fontSize: "28px", marginTop: "6px" }}>
                {reportData.lastAction}
              </div>
            </div>
          </div>

          {/* دعاء */}
          <p
            style={{
              marginTop: "15px",
              fontSize: "18px",
              textAlign: "center",
              lineHeight: 1.6,
              color: "#0B7459",
              fontWeight: "600",
              fontStyle: "italic",
              padding: "0 10px",
            }}
          >
            {reportData.prayerText}
          </p>
        </div>
      </div>
    </>
  );
}