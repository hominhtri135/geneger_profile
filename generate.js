const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const readline = require("readline");

// Tạo interface để đọc input từ console
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// --- Indian University Data ---
const universities = [
  {
    name: "IIM Bangalore",
    logo_url:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcThnWEFNAwfrO_g7WZj4XMyiecwYFcsObAMFw&s",
  },
];

// --- Name Lists ---
const indianMaleFirstNames = [
  "Aarav",
  "Vivaan",
  "Aditya",
  "Vihaan",
  "Arjun",
  "Sai",
  "Reyansh",
  "Ayaan",
  "Krishna",
  "Ishaan",
  "Mohammed",
  "Shaurya",
  "Atharv",
  "Advik",
  "Kabir",
  "Ansh",
  "Dhruv",
  "Aryan",
  "Rudra",
  "Veer",
  "Yash",
  "Rohan",
  "Neel",
  "Dev",
  "Samarth",
  "Ritvik",
  "Kartik",
  "Kian",
  "Zayn",
  "Parth",
  "Ravi",
  "Rajesh",
  "Sanjay",
  "Amit",
  "Prakash",
  "Vikram",
  "Anil",
  "Suresh",
  "Manoj",
  "Gopal",
  "Hari",
  "Deepak",
  "Naveen",
  "Ashok",
  "Mahesh",
  "Rahul",
];
const indianFemaleFirstNames = [
  "Saanvi",
  "Aanya",
  "Aadhya",
  "Aaradhya",
  "Ananya",
  "Pari",
  "Diya",
  "Myra",
  "Anika",
  "Avani",
  "Kiara",
  "Aisha",
  "Isha",
  "Riya",
  "Siya",
  "Navya",
  "Zara",
  "Fatima",
  "Shanaya",
  "Amaira",
  "Aditi",
  "Kavya",
  "Ira",
  "Tara",
  "Ishita",
  "Sia",
  "Anvi",
  "Prisha",
  "Naisha",
  "Eva",
  "Priya",
  "Pooja",
  "Sunita",
  "Geeta",
  "Lakshmi",
  "Sita",
  "Meena",
  "Kavita",
  "Usha",
  "Anjali",
  "Rekha",
  "Savita",
  "Radha",
  "Mala",
];
const indianLastNames = [
  "Sharma",
  "Verma",
  "Gupta",
  "Singh",
  "Patel",
  "Kumar",
  "Das",
  "Shah",
  "Mehta",
  "Reddy",
  "Yadav",
  "Jain",
  "Agarwal",
  "Mishra",
  "Pandey",
  "Tiwari",
  "Dubey",
  "Chauhan",
  "Rathore",
  "Joshi",
  "Khan",
  "Nair",
  "Menon",
  "Pillai",
  "Rao",
  "Naidu",
  "Chopra",
  "Malhotra",
  "Kapoor",
  "Khanna",
  "Desai",
  "Jha",
  "Sinha",
  "Choudhary",
  "Thakur",
  "Bose",
  "Ghosh",
  "Banerjee",
  "Iyer",
];
const programs = {
  Engineering: {
    prefix: "BTECH",
    departments: [
      "Computer Science",
      "Mechanical Engineering",
      "Electrical Engineering",
      "Civil Engineering",
    ],
  },
  Arts: {
    prefix: "BA",
    departments: ["History", "Economics", "Political Science", "Sociology"],
  },
  Science: {
    prefix: "BSC",
    departments: ["Physics", "Chemistry", "Mathematics", "Biology"],
  },
};

function createRealisticIndianStudent(gender) {
  const university =
    universities[Math.floor(Math.random() * universities.length)];
  const age = 18 + Math.floor(Math.random() * 7);
  const currentYear = new Date().getFullYear();
  const birthYear = currentYear - age;
  const birthMonth = 1 + Math.floor(Math.random() * 12);
  const birthDay = 1 + Math.floor(Math.random() * 28);
  const dob = `${birthYear}-${String(birthMonth).padStart(2, "0")}-${String(
    birthDay
  ).padStart(2, "0")}`;
  const programKeys = Object.keys(programs);
  const randomProgramKey =
    programKeys[Math.floor(Math.random() * programKeys.length)];
  const programInfo = programs[randomProgramKey];
  const department =
    programInfo.departments[
      Math.floor(Math.random() * programInfo.departments.length)
    ];
  const classPrefix = programInfo.prefix;
  const startYear = currentYear - Math.floor(Math.random() * 4);
  const endYear = startYear + 4;
  const course = `${startYear} - ${endYear}`;
  const studentClass = `${classPrefix}-${department
    .slice(0, 3)
    .toUpperCase()}-${startYear}`;
  const randomDigits = Math.floor(1000000 + Math.random() * 9000000);
  const studentId = `${classPrefix.slice(0, 2)}${startYear}.${randomDigits}`;
  const firstName =
    gender === "male"
      ? indianMaleFirstNames[
          Math.floor(Math.random() * indianMaleFirstNames.length)
        ]
      : indianFemaleFirstNames[
          Math.floor(Math.random() * indianFemaleFirstNames.length)
        ];
  const lastName =
    indianLastNames[Math.floor(Math.random() * indianLastNames.length)];
  const name = `${firstName} ${lastName}`;
  const validUntil = `15/07/${endYear}`;

  return {
    name,
    dob,
    course,
    class: studentClass,
    department,
    validUntil,
    studentId,
    gender,
    university,
    startYear,
    endYear,
  };
}

// Helper function để hỏi input từ người dùng
function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

// Function to process a single student card
async function processStudentCard(
  browser,
  gender,
  photoFile,
  imagesDir,
  outputDir,
  studentData = null,
  sequenceNumber = 1
) {
  // Nếu không có studentData được truyền vào, tạo mới
  if (!studentData) {
    studentData = createRealisticIndianStudent(gender);
  }

  studentData.photoUrl = `file://${path.join(imagesDir, photoFile)}`;

  console.log(`   -> ${studentData.university.name}: ${studentData.name}...`);

  // Format số thứ tự với leading zeros (ví dụ: 001, 002, ...)
  const paddedSequence = String(sequenceNumber).padStart(3, "0");

  const studentOutputDir = path.join(
    outputDir,
    `${paddedSequence}_${studentData.university.name.replace(/\s/g, "_")}_${
      studentData.studentId
    }`
  );
  if (!fs.existsSync(studentOutputDir))
    fs.mkdirSync(studentOutputDir, { recursive: true });

  // Generate Student ID Card
  const cardPage = await browser.newPage();
  await cardPage.goto(`file://${path.join(__dirname, "index.html")}`, {
    waitUntil: "networkidle0",
  });
  await cardPage.evaluate((data) => {
    const uniLogo = document.getElementById("uni-logo");
    if (uniLogo) uniLogo.src = data.university.logo_url;

    const uniName = document.getElementById("uni-name");
    if (uniName) uniName.textContent = data.university.name;

    const studentPhoto = document.getElementById("student-photo");
    if (studentPhoto) studentPhoto.src = data.photoUrl;

    const studentName = document.getElementById("student-name");
    if (studentName) studentName.textContent = data.name;

    const studentDob = document.getElementById("student-dob");
    if (studentDob) studentDob.textContent = data.dob;

    const studentCourse = document.getElementById("student-course");
    if (studentCourse) studentCourse.textContent = data.course;

    const studentClass = document.getElementById("student-class");
    if (studentClass) studentClass.textContent = data.class;

    const studentDepartment = document.getElementById("student-department");
    if (studentDepartment) studentDepartment.textContent = data.department;

    const validUntil = document.getElementById("valid-until");
    if (validUntil) validUntil.textContent = data.validUntil;

    const studentId = document.getElementById("student-id");
    if (studentId) studentId.textContent = data.studentId;
  }, studentData);
  const cardElement = await cardPage.$(".student-card-container");
  if (cardElement) {
    await cardElement.screenshot({
      path: path.join(studentOutputDir, "student_card.png"),
      omitBackground: true,
    });
  }
  await cardPage.close();

  // Generate Registration Fee Receipt (in PDF format)
  const receiptPage = await browser.newPage();
  await receiptPage.goto(`file://${path.join(__dirname, "fee_receipt.html")}`, {
    waitUntil: "networkidle0",
  });
  await receiptPage.evaluate((data) => {
    const uniLogoReceipt = document.getElementById("uni-logo-receipt");
    if (uniLogoReceipt) uniLogoReceipt.src = data.university.logo_url;

    const uniNameReceipt = document.getElementById("uni-name-receipt");
    if (uniNameReceipt) uniNameReceipt.textContent = data.university.name;

    const receiptId = document.getElementById("receipt-id");
    if (receiptId)
      receiptId.textContent = `FEE-REC-${Math.floor(
        Math.random() * 100000000
      )}`;

    const receiptDate = document.getElementById("receipt-date");
    if (receiptDate)
      receiptDate.textContent = new Date().toLocaleDateString("en-GB");

    const studentNameReceipt = document.getElementById("student-name-receipt");
    if (studentNameReceipt) studentNameReceipt.textContent = data.name;

    const studentIdReceipt = document.getElementById("student-id-receipt");
    if (studentIdReceipt) studentIdReceipt.textContent = data.studentId;

    const studentCourseReceipt = document.getElementById(
      "student-course-receipt"
    );
    if (studentCourseReceipt) studentCourseReceipt.textContent = data.course;

    const studentDepartmentReceipt = document.getElementById(
      "student-department-receipt"
    );
    if (studentDepartmentReceipt)
      studentDepartmentReceipt.textContent = data.department;

    const feeAmount = document.getElementById("fee-amount");
    if (feeAmount)
      feeAmount.textContent = (
        Math.floor(Math.random() * (20000 - 5000 + 1)) + 5000
      ).toLocaleString("en-IN");
  }, studentData);
  await receiptPage.pdf({
    path: path.join(studentOutputDir, "registration_fee_receipt.pdf"),
    format: "A4",
    printBackground: true,
  });
  await receiptPage.close();

  // Generate Official Letter (in PDF format)
  const letterPage = await browser.newPage();
  await letterPage.goto(
    `file://${path.join(__dirname, "official_letter.html")}`,
    { waitUntil: "networkidle0" }
  );
  await letterPage.evaluate((data) => {
    const today = new Date();
    const formattedDate = today.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });

    const uniLogoLetter = document.getElementById("uni-logo-letter");
    if (uniLogoLetter) uniLogoLetter.src = data.university.logo_url;

    const uniNameLetter = document.getElementById("uni-name-letter");
    if (uniNameLetter) uniNameLetter.textContent = data.university.name;

    const letterDate = document.getElementById("letter-date");
    if (letterDate) letterDate.textContent = formattedDate;

    const studentNameLetter = document.getElementById("student-name-letter");
    if (studentNameLetter) studentNameLetter.textContent = data.name;

    const studentIdLetter = document.getElementById("student-id-letter");
    if (studentIdLetter) studentIdLetter.textContent = data.studentId;

    const studentCourseLetter = document.getElementById(
      "student-course-letter"
    );
    if (studentCourseLetter) studentCourseLetter.textContent = data.course;

    const studentDepartmentLetter = document.getElementById(
      "student-department-letter"
    );
    if (studentDepartmentLetter)
      studentDepartmentLetter.textContent = data.department;

    const studentStartYear = document.getElementById("student-start-year");
    if (studentStartYear) studentStartYear.textContent = data.startYear;

    const studentEndYear = document.getElementById("student-end-year");
    if (studentEndYear) studentEndYear.textContent = data.endYear;

    const uniNameSignature = document.getElementById("uni-name-signature");
    if (uniNameSignature) uniNameSignature.textContent = data.university.name;
  }, studentData);
  await letterPage.pdf({
    path: path.join(studentOutputDir, "official_letter.pdf"),
    format: "A4",
    printBackground: true,
  });
  await letterPage.close();

  // Tạo script auto-fill từ dữ liệu JSON
  const autoFillScript = generateAutoFillScript(studentData);
  fs.writeFileSync(
    path.join(studentOutputDir, "auto_fill_script.js"),
    autoFillScript,
    "utf8"
  );

  delete studentData.photoUrl;
  fs.writeFileSync(
    path.join(studentOutputDir, "student_info.json"),
    JSON.stringify(studentData, null, 2),
    "utf8"
  );

  return 1; // Return count of processed files
}

// Function để tạo script auto-fill từ dữ liệu JSON
function generateAutoFillScript(data) {
  const [firstName, lastName] = data.name.split(" ");
  const dobDate = new Date(data.dob);
  const day = String(dobDate.getDate()).padStart(2, "0");
  const month = dobDate.toLocaleString("vi-VN", { month: "long" });
  const year = dobDate.getFullYear();

  return `(async () => {
  const data = ${JSON.stringify(data, null, 2)};

  const delay = ms => new Promise(r => setTimeout(r, ms));
  const set = async (sel, val) => {
    const el = document.querySelector(sel);
    if (!el) return;
    const setVal = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set;
    setVal.call(el, val);
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
    el.dispatchEvent(new Event("blur", { bubbles: true }));
    await delay(150);
  };

  const selectFromDropdown = async (inputSelector, menuSelector, matchText) => {
    const el = document.querySelector(inputSelector);
    if (!el) return;
    el.focus();
    el.click();
    await delay(500);
    el.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    await delay(800);
    const options = document.querySelectorAll(\`\${menuSelector} [role="option"]\`);
    const match = [...options].find(opt => opt.innerText.toLowerCase().includes(matchText.toLowerCase()));
    match?.click();
    await delay(300);
  };

  // 1. Chọn quốc gia trước
  const selectCountry = async () => {
    const input = document.querySelector('#sid-country');
    if (!input) return;
    input.focus();
    input.click();
    await delay(400);
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    await delay(800);
    const options = document.querySelectorAll('#sid-country-menu [role="option"]');
    const match = [...options].find(opt => opt.innerText.toLowerCase().includes("ấn độ"));
    match?.click();
    await delay(400);
  };

  await selectCountry();

  // 2. Điền tên trường đại học và chờ chọn
  const pasteSchool = async (val) => {
    const el = document.querySelector('#sid-college-name');
    if (!el) return;
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(el, val);
    el.dispatchEvent(new Event('input', { bubbles: true }));
    await delay(2000); // đợi danh sách load xong
    document.querySelector('#sid-college-name-menu [role="option"]')?.click();
    await delay(500);
  };

  await pasteSchool(data.university.name);

  // 3. Điền các trường còn lại
  const firstName = "${firstName}";
  const lastName = "${lastName}";

  await set('#sid-first-name', firstName);
  await set('#sid-last-name', lastName);
  await set('#sid-birthdate-day', "${day}");
  await set('#sid-birthdate-year', "${year}");

  // 4. Chọn tháng sinh
  const selectMonth = async () => {
    const el = document.querySelector('#sid-birthdate__month');
    if (!el) return;
    el.focus();
    el.click();
    await delay(400);
    el.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    await delay(500);
    [...document.querySelectorAll('#sid-birthdate__month-menu [role="option"]')]
      .find(o => o.innerText.toLowerCase().includes("${month}".toLowerCase()))?.click();
    await delay(300);
  };

  await selectMonth();

  console.log("✅ Form đã được điền từ JSON cho: " + data.name);
})();`;
}

async function generateCards() {
  const baseImagesDir = path.join(__dirname, "images");
  const outputDir = path.join(__dirname, "output");
  const MAX_CONCURRENT = 10; // Số luồng xử lý đồng thời tối đa

  console.log("🚀 Student Card Generator - Interactive Mode");
  console.log("============================================");

  // Hỏi số lượng cần tạo
  const totalCount = parseInt(
    await askQuestion("💬 Nhập số lượng thẻ sinh viên cần tạo: ")
  );
  if (isNaN(totalCount) || totalCount <= 0) {
    console.log("❌ Số lượng không hợp lệ!");
    rl.close();
    return;
  }

  // Hỏi giới tính
  console.log("\n📋 Chọn giới tính:");
  console.log("1. Nam (male)");
  console.log("2. Nữ (female)");
  console.log("3. Ngẫu nhiên (random)");

  const genderChoice = await askQuestion("👤 Nhập lựa chọn (1/2/3): ");
  let targetGender;

  switch (genderChoice) {
    case "1":
      targetGender = "male";
      break;
    case "2":
      targetGender = "female";
      break;
    case "3":
      targetGender = "random";
      break;
    default:
      console.log("❌ Lựa chọn không hợp lệ!");
      rl.close();
      return;
  }

  rl.close(); // Đóng interface sau khi có đủ thông tin

  // Tạo thư mục với timestamp
  const now = new Date();
  const timestamp =
    now.getHours().toString().padStart(2, "0") +
    now.getMinutes().toString().padStart(2, "0") +
    now.getSeconds().toString().padStart(2, "0") +
    "_" +
    now.getDate().toString().padStart(2, "0") +
    now.getMonth().toString().padStart(2, "0") +
    now.getFullYear().toString().padStart(2, "0");

  const sessionOutputDir = path.join(outputDir, timestamp);

  if (!fs.existsSync(baseImagesDir)) {
    console.log(
      '❌ "images" directory not found. Creating a sample directory structure...'
    );
    fs.mkdirSync(baseImagesDir);
    fs.mkdirSync(path.join(baseImagesDir, "male"));
    fs.mkdirSync(path.join(baseImagesDir, "female"));
    console.log(
      '✅ Created "images/male" and "images/female" directories. Please add photos and run again.'
    );
    return;
  }
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);
  if (!fs.existsSync(sessionOutputDir))
    fs.mkdirSync(sessionOutputDir, { recursive: true });

  // Lấy danh sách ảnh theo giới tính
  let availableImages = [];

  if (targetGender === "random") {
    // Lấy cả nam và nữ
    const maleDir = path.join(baseImagesDir, "male");
    const femaleDir = path.join(baseImagesDir, "female");

    if (fs.existsSync(maleDir)) {
      const maleImages = fs
        .readdirSync(maleDir)
        .filter((file) => /\.(jpg|jpeg|png|gif)$/i.test(file))
        .map((file) => ({ gender: "male", file, dir: maleDir }));
      availableImages.push(...maleImages);
    }

    if (fs.existsSync(femaleDir)) {
      const femaleImages = fs
        .readdirSync(femaleDir)
        .filter((file) => /\.(jpg|jpeg|png|gif)$/i.test(file))
        .map((file) => ({ gender: "female", file, dir: femaleDir }));
      availableImages.push(...femaleImages);
    }
  } else {
    // Chỉ lấy giới tính được chọn
    const targetDir = path.join(baseImagesDir, targetGender);
    if (fs.existsSync(targetDir)) {
      const images = fs
        .readdirSync(targetDir)
        .filter((file) => /\.(jpg|jpeg|png|gif)$/i.test(file))
        .map((file) => ({ gender: targetGender, file, dir: targetDir }));
      availableImages.push(...images);
    }
  }

  if (availableImages.length === 0) {
    console.log(
      `❌ Không tìm thấy ảnh nào trong thư mục ${
        targetGender === "random" ? "male/female" : targetGender
      }!`
    );
    return;
  }

  console.log(
    `\n✅ Tìm thấy ${availableImages.length} ảnh. Bắt đầu tạo ${totalCount} thẻ sinh viên...`
  );
  console.log(`📁 Kết quả sẽ được lưu trong: ${sessionOutputDir}`);

  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  let totalFilesProcessed = 0;
  const allTasks = [];

  // Tạo danh sách tác vụ với logic lặp vòng tròn
  for (let i = 0; i < totalCount; i++) {
    const imageIndex = i % availableImages.length; // Lặp vòng tròn
    const imageInfo = availableImages[imageIndex];

    // Tạo dữ liệu sinh viên mới cho mỗi lần tạo
    const studentData = createRealisticIndianStudent(imageInfo.gender);

    allTasks.push({
      gender: imageInfo.gender,
      photoFile: imageInfo.file,
      imagesDir: imageInfo.dir,
      studentData: studentData,
      index: i + 1,
    });
  }

  console.log(
    `\n🔄 Sẽ xử lý ${allTasks.length} thẻ sinh viên với ${availableImages.length} ảnh (lặp vòng tròn khi cần)...`
  );

  // Xử lý các tác vụ theo từng batch với số lượng giới hạn
  for (let i = 0; i < allTasks.length; i += MAX_CONCURRENT) {
    const batch = allTasks.slice(i, i + MAX_CONCURRENT);

    console.log(
      `\n📦 Đang xử lý batch ${Math.floor(i / MAX_CONCURRENT) + 1}/${Math.ceil(
        allTasks.length / MAX_CONCURRENT
      )} (${batch.length} files)...`
    );

    const batchPromises = batch.map((task) =>
      processStudentCard(
        browser,
        task.gender,
        task.photoFile,
        task.imagesDir,
        sessionOutputDir, // Sử dụng sessionOutputDir thay vì outputDir
        task.studentData,
        task.index // Truyền số thứ tự
      )
        .then((result) => {
          const paddedSequence = String(task.index).padStart(3, "0");
          console.log(
            `   ✅ Hoàn thành ${
              task.index
            }/${totalCount}: ${paddedSequence}_${task.studentData.university.name.replace(
              /\s/g,
              "_"
            )}_${task.studentData.studentId}`
          );
          return result;
        })
        .catch((error) => {
          console.error(
            `   ❌ Lỗi ${task.index}/${totalCount}: ${error.message}`
          );
          return 0;
        })
    );

    try {
      const results = await Promise.all(batchPromises);
      totalFilesProcessed += results.reduce((sum, count) => sum + count, 0);

      console.log(
        `✅ Hoàn thành batch ${Math.floor(i / MAX_CONCURRENT) + 1}/${Math.ceil(
          allTasks.length / MAX_CONCURRENT
        )} - Tổng đã xử lý: ${totalFilesProcessed}/${totalCount}`
      );
    } catch (error) {
      console.error(
        `❌ Lỗi khi xử lý batch ${Math.floor(i / MAX_CONCURRENT) + 1}:`,
        error
      );
    }
  }

  await browser.close();

  console.log("\n" + "=".repeat(50));
  if (totalFilesProcessed > 0) {
    console.log(
      `🚀 THÀNH CÔNG! Đã tạo ${totalFilesProcessed}/${totalCount} bộ tài liệu sinh viên.`
    );
    console.log(`📁 Kết quả được lưu trong thư mục: ${sessionOutputDir}`);
    console.log(`📅 Session timestamp: ${timestamp}`);
    console.log("\n📋 Mỗi sinh viên có:");
    console.log("   - student_card.png (Thẻ sinh viên)");
    console.log("   - registration_fee_receipt.pdf (Biên lai phí)");
    console.log("   - official_letter.pdf (Thư chính thức)");
    console.log("   - student_info.json (Thông tin JSON)");
    console.log("   - auto_fill_script.js (Script tự động điền form)");

    if (totalFilesProcessed < totalCount) {
      console.log(
        `\n⚠️  Lưu ý: ${
          totalCount - totalFilesProcessed
        } file không được xử lý do lỗi.`
      );
    }
  } else {
    console.log("\n🔴 Không có file nào được xử lý thành công.");
  }
  console.log("=".repeat(50));
}

generateCards().catch(err => {
    console.error('❌ A serious error occurred:', err);
    process.exit(1);
});