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
    border: "1px solid #0B7459", // Updated to primary color
    textAlign: "center",
    padding: "8px 12px",
    fontSize: 14,
  };

  const infoCardStyle = {
    border: "2px solid #0B7459", // Updated to primary color
    borderRadius: "0 0 20px 20px",
    padding: "12px 25px",
    minWidth: 130,
    textAlign: "center",
    fontWeight: "bold",
    color: "#0B7459", // Updated to primary color
    boxShadow: "0 2px 8px rgba(11, 116, 89, 0.25)", // Shadow using primary color
    backgroundColor: "#E6F4F1", // Light background derived from primary color
  };

  return (
    <div
      dir="rtl"
      style={{
        maxWidth: 900,
        margin: "30px auto",
        padding: 24,
        boxShadow: "0 0 20px rgba(11, 116, 89, 0.15)", // Shadow using primary color
        background: "#fff",
        fontFamily: `"Tahoma", Arial, "Segoe UI", sans-serif`,
        fontSize: 15,
        color: "#333",
        borderRadius: 12,
      }}
    >
      {/* شعار الجامعة */}
      <div style={{ textAlign: "center", marginBottom: 15 }}>
        <Image src="/logo.png" width={80} height={80} alt="شعار الجامعة" />
      </div>

      {/* الترتيب على المرحلة */}
      <div
        style={{
          float: "left",
          border: "1px solid #0B7459", // Updated to primary color
          borderRadius: 8,
          padding: "8px 24px",
          color: "#0B7459", // Updated to primary color
          fontWeight: "bold",
          fontSize: 24,
          direction: "rtl",
          boxShadow: "0 2px 6px rgba(11, 116, 89, 0.5)", // Shadow using primary color
          backgroundColor: "#E6F4F1", // Light background derived from primary color
          minWidth: 140,
        }}
      >
        <div>الترتيب على المرحلة</div>
        <div style={{ marginTop: 6 }}>{reportData.order}</div>
      </div>

      {/* عنوان التقرير */}
      <h2
        style={{
          textAlign: "center",
          fontWeight: "bold",
          marginTop: 0,
          marginBottom: 25,
          color: "#0B7459", // Updated to primary color
          fontSize: 24,
          letterSpacing: "0.05em",
          borderBottom: "2px solid #0B7459", // Updated to primary color
          paddingBottom: 10,
        }}
      >
        التقرير الختامي للفصل الثاني 1446هـ
      </h2>

      {/* اسم الطالب والمرحلة */}
      <p style={{ marginTop: 0, marginBottom: 20, fontSize: 17 }}>
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
              backgroundColor: "#E6F4F1", // Light background derived from primary color
              marginBottom: 15,
              borderRadius: 6,
              overflow: "hidden",
            }}
          >
            <thead style={{ backgroundColor: "#084D3E" }}> {/* Darker shade of primary color */}
              <tr>
                <th style={{ ...cellStyle, fontWeight: "bold", color: "#fff" }}>المفترض</th>
                <th style={{ ...cellStyle, fontWeight: "bold", color: "#fff" }}>المنجز</th>
                <th style={{ ...cellStyle, fontWeight: "bold", color: "#fff" }}>الإضافي (+) | العجز (-)</th>
                <th style={{ ...cellStyle, fontWeight: "bold", color: "#fff" }}>النسبة</th>
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
                marginTop: 6,
                fontSize: 16,
                color: "#0B7459", // Updated to primary color
                paddingBottom: 6,
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
          backgroundColor: "#E6F4F1", // Light background derived from primary color
          marginBottom: 20,
          borderRadius: 6,
          overflow: "hidden",
          boxShadow: "inset 0 0 5px rgba(11, 116, 89, 0.2)", // Shadow using primary color
        }}
      >
        <thead style={{ backgroundColor: "#084D3E" }}> {/* Darker shade of primary color */}
          <tr>
            <th style={{ ...cellStyle, fontWeight: "bold", color: "#fff" }}>المفترض</th>
            <th style={{ ...cellStyle, fontWeight: "bold", color: "#fff" }}>أيام الغياب</th>
            <th style={{ ...cellStyle, fontWeight: "bold", color: "#fff" }}>أيام التأخير</th>
            <th style={{ ...cellStyle, fontWeight: "bold", color: "#fff" }}>أيام الحضور</th>
            <th style={{ ...cellStyle, fontWeight: "bold", color: "#fff" }}>النسبة</th>
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
        style={{
          display: "flex",
          justifyContent: "space-around",
          marginTop: 30,
          gap: 15,
          flexWrap: "wrap",
        }}
      >
        <div style={infoCardStyle}>
          <div style={{ fontSize: 14 }}>عدد مرات نجم الحلقة</div>
          <div style={{ fontSize: 28, marginTop: 6 }}>{reportData.starTimes}</div>
        </div>
        <div style={infoCardStyle}>
          <div style={{ fontSize: 14 }}>النسبة</div>
          <div style={{ fontSize: 28, marginTop: 6 }}>{reportData.scorePercent} %</div>
        </div>
        <div style={infoCardStyle}>
          <div style={{ fontSize: 14 }}>التقدير</div>
          <div style={{ fontSize: 28, marginTop: 6 }}>{reportData.grade}</div>
        </div>
        <div style={infoCardStyle}>
          <div style={{ fontSize: 14 }}>آخر إجراء</div>
          <div style={{ fontSize: 28, marginTop: 6 }}>{reportData.lastAction}</div>
        </div>
      </div>

      {/* دعاء */}
      <p
        style={{
          marginTop: 35,
          fontSize: 18,
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
  );
}