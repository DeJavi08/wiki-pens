---
title: "Laboratorium Kontrol Cerdas & Robotika"
slug: "lab-kontrol-cerdas"
category: "Riset & Inovasi"
subcategory: "Pusat Unggulan Riset"
tags: ["Lab", "Kontrol Cerdas", "ROS", "SLAM", "AI", "Kinematika"]
aliases: ["Lab Kontrol PENS", "Intelligent Control Lab", "Lab Robotika Sukolilo"]
updated: "2026-03-25"
summary: "Laboratorium riset sentral yang mengeksplorasi sensor fusion, sistem operasi robot (ROS/ROS2), algoritma lokalisasi SLAM, dan kestabilan gerak otonom."
icon: "bi-diagram-3"
featured: false
---

# Laboratorium Kontrol Cerdas & Robotika

**Laboratorium Kontrol Cerdas & Robotika** (*Intelligent Control & Robotics Laboratory*) berlokasi di Gedung D4 PENS ([[Infrastruktur Kampus]]). Laboratorium ini berfokus pada fondasi teoritis dan implementasi perangkat lunak sistem kendali tingkat tinggi (*high-level control*), komputasi penglihatan (*computer vision*), serta lokalisasi simultan dan pemetaan (*SLAM*).

> [!TIP]
> Lab ini bertindak sebagai otak konseptual yang menyuplai algoritma kecerdasan bagi robot-robot di [[ER2C]].

---

## 1. Domain Penelitian Utama

### A. Robot Operating System (ROS / ROS 2)
Mengembangkan arsitektur node terdistribusi untuk pertukaran pesan real-time antara sensor LiDAR, kamera RGB-D, dan mikrokontroler aktuator motor servo.

### B. Simultaneous Localization and Mapping (SLAM)
Membangun peta 2D/3D lingkungan secara real-time pada kendaraan otonom:
- Digunakan oleh [[Tim ERSOW]] untuk membaca posisi robot relatif terhadap gawang dalam hitungan milidetik.
- Diterapkan pada [[Tim EFFIRO]] untuk menelusuri lorong labirin yang dipenuhi asap dan rintangan api tanpa tersesat.

### C. Inverse Kinematics & Bipedal Walking Pattern
Merumuskan kalkulasi matematika sudut persendian kaki robot:
- Algoritma *Zero Moment Point (ZMP)* dan *Linear Inverted Pendulum Model (LIPM)* yang diterapkan pada [[Tim EROS]] agar robot dapat berlari dan menendang bola tanpa kehilangan keseimbangan.
- Penerapan gerak luwes dan ritmis pada robot seni [[Tim ERISA]].

---

## 2. Kolaborasi Lintas Departemen & Peneliti

- Bekerja sama erat dengan akademisi di [[Departemen DTIK]] untuk optimasi jaringan syaraf tiruan (*Deep Neural Networks*) pada papan komputasi mini seperti NVIDIA Jetson Orin dan Raspberry Pi.
- Berkolaborasi dengan peneliti di [[Departemen DTE]] untuk desain bus komunikasi CAN dan sinyal sensor presisi.
- Dibimbing secara berkala oleh dewan pakar di [[Dewan Guru Besar]].
