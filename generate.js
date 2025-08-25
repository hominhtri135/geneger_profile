const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// --- Indian University Data ---
const universities = [
    // { "name": "University of Delhi", "logo_url": "https://upload.wikimedia.org/wikipedia/commons/6/62/Delhi_University%27s_official_logo.png" },
    { "name": "IIM Bangalore", "logo_url": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcThnWEFNAwfrO_g7WZj4XMyiecwYFcsObAMFw&s" },
    // { "name": "Osmania University", "logo_url": "https://seeklogo.com/images/O/osmania-university-logo-EDAE9EE2A9-seeklogo.com.png" },
    // { "name": "Amrita Vishwa Vidyapeetham", "logo_url": "https://upload.wikimedia.org/wikipedia/en/thumb/3/30/Amrita_Vishwa_Vidyapeetham_-_Logo_Icon.svg/1200px-Amrita_Vishwa_Vidyapeetham_-_Logo_Icon.svg.png" },
    // { "name": "Jamia Millia Islamia", "logo_url": "https://upload.wikimedia.org/wikipedia/en/thumb/2/2a/Jamia_Millia_Islamia_Logo.svg/1200px-Jamia_Millia_Islamia_Logo.svg.png" },
    { "name": "Christ University", "logo_url": "https://upload.wikimedia.org/wikipedia/en/d/dd/Official_Logo_of_CHRIST%28Deemed_to_be_University%29%2C_bangalore.jpg" }
];

// --- Name Lists ---
const indianMaleFirstNames = ['Aarav', 'Vivaan', 'Aditya', 'Vihaan', 'Arjun', 'Sai', 'Reyansh', 'Ayaan', 'Krishna', 'Ishaan', 'Mohammed', 'Shaurya', 'Atharv', 'Advik', 'Kabir', 'Ansh', 'Dhruv', 'Aryan', 'Rudra', 'Veer', 'Yash', 'Rohan', 'Neel', 'Dev', 'Samarth', 'Ritvik', 'Kartik', 'Kian', 'Zayn', 'Parth', 'Ravi', 'Rajesh', 'Sanjay', 'Amit', 'Prakash', 'Vikram', 'Anil', 'Suresh', 'Manoj', 'Gopal', 'Hari', 'Deepak', 'Naveen', 'Ashok', 'Mahesh', 'Rahul'];
const indianFemaleFirstNames = ['Saanvi', 'Aanya', 'Aadhya', 'Aaradhya', 'Ananya', 'Pari', 'Diya', 'Myra', 'Anika', 'Avani', 'Kiara', 'Aisha', 'Isha', 'Riya', 'Siya', 'Navya', 'Zara', 'Fatima', 'Shanaya', 'Amaira', 'Aditi', 'Kavya', 'Ira', 'Tara', 'Ishita', 'Sia', 'Anvi', 'Prisha', 'Naisha', 'Eva', 'Priya', 'Pooja', 'Sunita', 'Geeta', 'Lakshmi', 'Sita', 'Meena', 'Kavita', 'Usha', 'Anjali', 'Rekha', 'Savita', 'Radha', 'Mala'];
const indianLastNames = ['Sharma', 'Verma', 'Gupta', 'Singh', 'Patel', 'Kumar', 'Das', 'Shah', 'Mehta', 'Reddy', 'Yadav', 'Jain', 'Agarwal', 'Mishra', 'Pandey', 'Tiwari', 'Dubey', 'Chauhan', 'Rathore', 'Joshi', 'Khan', 'Nair', 'Menon', 'Pillai', 'Rao', 'Naidu', 'Chopra', 'Malhotra', 'Kapoor', 'Khanna', 'Desai', 'Jha', 'Sinha', 'Choudhary', 'Thakur', 'Bose', 'Ghosh', 'Banerjee', 'Iyer'];
const programs = {'Engineering': {prefix: 'BTECH', departments: ['Computer Science', 'Mechanical Engineering', 'Electrical Engineering', 'Civil Engineering']}, 'Arts': {prefix: 'BA', departments: ['History', 'Economics', 'Political Science', 'Sociology']}, 'Science': {prefix: 'BSC', departments: ['Physics', 'Chemistry', 'Mathematics', 'Biology']}};

function createRealisticIndianStudent(gender) {
    const university = universities[Math.floor(Math.random() * universities.length)];
    const age = 18 + Math.floor(Math.random() * 7);
    const currentYear = new Date().getFullYear();
    const birthYear = currentYear - age;
    const birthMonth = 1 + Math.floor(Math.random() * 12);
    const birthDay = 1 + Math.floor(Math.random() * 28);
    const dob = `${birthYear}-${String(birthMonth).padStart(2, '0')}-${String(birthDay).padStart(2, '0')}`;
    const programKeys = Object.keys(programs);
    const randomProgramKey = programKeys[Math.floor(Math.random() * programKeys.length)];
    const programInfo = programs[randomProgramKey];
    const department = programInfo.departments[Math.floor(Math.random() * programInfo.departments.length)];
    const classPrefix = programInfo.prefix;
    const startYear = currentYear - Math.floor(Math.random() * 4);
    const endYear = startYear + 4;
    const course = `${startYear} - ${endYear}`;
    const studentClass = `${classPrefix}-${department.slice(0, 3).toUpperCase()}-${startYear}`;
    const randomDigits = Math.floor(1000000 + Math.random() * 9000000);
    const studentId = `${classPrefix.slice(0, 2)}${startYear}.${randomDigits}`;
    const firstName = gender === 'male' ? indianMaleFirstNames[Math.floor(Math.random() * indianMaleFirstNames.length)] : indianFemaleFirstNames[Math.floor(Math.random() * indianFemaleFirstNames.length)];
    const lastName = indianLastNames[Math.floor(Math.random() * indianLastNames.length)];
    const name = `${firstName} ${lastName}`;
    const validUntil = `15/07/${endYear}`;

    return { name, dob, course, class: studentClass, department, validUntil, studentId, gender, university, startYear, endYear };
}

async function generateCards() {
    const baseImagesDir = path.join(__dirname, 'images');
    const outputDir = path.join(__dirname, 'output');
    const genders = ['male', 'female'];

    if (!fs.existsSync(baseImagesDir)) {
        console.log('❌ "images" directory not found. Creating a sample directory structure...');
        fs.mkdirSync(baseImagesDir);
        fs.mkdirSync(path.join(baseImagesDir, 'male'));
        fs.mkdirSync(path.join(baseImagesDir, 'female'));
        console.log('✅ Created "images/male" and "images/female" directories. Please add photos and run again.');
        return;
    }
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

    const browser = await puppeteer.launch({ headless: true });

    let totalFilesProcessed = 0;

    for (const gender of genders) {
        const imagesDir = path.join(baseImagesDir, gender);
        if (!fs.existsSync(imagesDir)) continue;

        const imageFiles = fs.readdirSync(imagesDir).filter(file => /\.(jpg|jpeg|png|gif)$/i.test(file));
        if (imageFiles.length === 0) continue;

        console.log(`\n✅ Found ${imageFiles.length} images in "${gender}" directory. Starting to process...`);

        for (const photoFile of imageFiles) {
            const studentData = createRealisticIndianStudent(gender);
            studentData.photoUrl = `file://${path.join(imagesDir, photoFile)}`;
            
            console.log(`   -> ${studentData.university.name}: ${studentData.name}...`);
            const studentOutputDir = path.join(outputDir, `${studentData.university.name.replace(/\s/g, '_')}_${studentData.studentId}`);
            if (!fs.existsSync(studentOutputDir)) fs.mkdirSync(studentOutputDir, { recursive: true });

            // Generate Student ID Card
            const cardPage = await browser.newPage();
            await cardPage.goto(`file://${path.join(__dirname, 'index.html')}`, { waitUntil: 'networkidle0' });
            await cardPage.evaluate((data) => {
                const uniLogo = document.getElementById('uni-logo');
                if (uniLogo) uniLogo.src = data.university.logo_url;
                
                const uniName = document.getElementById('uni-name');
                if (uniName) uniName.textContent = data.university.name;

                const studentPhoto = document.getElementById('student-photo');
                if (studentPhoto) studentPhoto.src = data.photoUrl;

                const studentName = document.getElementById('student-name');
                if (studentName) studentName.textContent = data.name;

                const studentDob = document.getElementById('student-dob');
                if (studentDob) studentDob.textContent = data.dob;

                const studentCourse = document.getElementById('student-course');
                if (studentCourse) studentCourse.textContent = data.course;

                const studentClass = document.getElementById('student-class');
                if (studentClass) studentClass.textContent = data.class;

                const studentDepartment = document.getElementById('student-department');
                if (studentDepartment) studentDepartment.textContent = data.department;

                const validUntil = document.getElementById('valid-until');
                if (validUntil) validUntil.textContent = data.validUntil;

                const studentId = document.getElementById('student-id');
                if (studentId) studentId.textContent = data.studentId;
            }, studentData);
            const cardElement = await cardPage.$('.student-card-container');
            if(cardElement) {
                await cardElement.screenshot({
                    path: path.join(studentOutputDir, 'student_card.png'),
                    omitBackground: true
                });
            }
            await cardPage.close();

            // Generate Registration Fee Receipt (in PDF format)
            const receiptPage = await browser.newPage();
            await receiptPage.goto(`file://${path.join(__dirname, 'fee_receipt.html')}`, { waitUntil: 'networkidle0' });
            await receiptPage.evaluate((data) => {
                const uniLogoReceipt = document.getElementById('uni-logo-receipt');
                if (uniLogoReceipt) uniLogoReceipt.src = data.university.logo_url;

                const uniNameReceipt = document.getElementById('uni-name-receipt');
                if (uniNameReceipt) uniNameReceipt.textContent = data.university.name;

                const receiptId = document.getElementById('receipt-id');
                if (receiptId) receiptId.textContent = `FEE-REC-${Math.floor(Math.random() * 100000000)}`;

                const receiptDate = document.getElementById('receipt-date');
                if (receiptDate) receiptDate.textContent = new Date().toLocaleDateString('en-GB');

                const studentNameReceipt = document.getElementById('student-name-receipt');
                if (studentNameReceipt) studentNameReceipt.textContent = data.name;

                const studentIdReceipt = document.getElementById('student-id-receipt');
                if (studentIdReceipt) studentIdReceipt.textContent = data.studentId;

                const studentCourseReceipt = document.getElementById('student-course-receipt');
                if (studentCourseReceipt) studentCourseReceipt.textContent = data.course;

                const studentDepartmentReceipt = document.getElementById('student-department-receipt');
                if (studentDepartmentReceipt) studentDepartmentReceipt.textContent = data.department;
                
                const feeAmount = document.getElementById('fee-amount');
                if (feeAmount) feeAmount.textContent = (Math.floor(Math.random() * (20000 - 5000 + 1)) + 5000).toLocaleString('en-IN');
            }, studentData);
            await receiptPage.pdf({
                path: path.join(studentOutputDir, 'registration_fee_receipt.pdf'),
                format: 'A4',
                printBackground: true
            });
            await receiptPage.close();

            // Generate Official Letter (in PDF format)
            const letterPage = await browser.newPage();
            await letterPage.goto(`file://${path.join(__dirname, 'official_letter.html')}`, { waitUntil: 'networkidle0' });
            await letterPage.evaluate((data) => {
                const today = new Date();
                const formattedDate = today.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
                
                const uniLogoLetter = document.getElementById('uni-logo-letter');
                if (uniLogoLetter) uniLogoLetter.src = data.university.logo_url;

                const uniNameLetter = document.getElementById('uni-name-letter');
                if (uniNameLetter) uniNameLetter.textContent = data.university.name;
                
                const letterDate = document.getElementById('letter-date');
                if (letterDate) letterDate.textContent = formattedDate;
                
                const studentNameLetter = document.getElementById('student-name-letter');
                if (studentNameLetter) studentNameLetter.textContent = data.name;
                
                const studentIdLetter = document.getElementById('student-id-letter');
                if (studentIdLetter) studentIdLetter.textContent = data.studentId;
                
                const studentCourseLetter = document.getElementById('student-course-letter');
                if (studentCourseLetter) studentCourseLetter.textContent = data.course;
                
                const studentDepartmentLetter = document.getElementById('student-department-letter');
                if (studentDepartmentLetter) studentDepartmentLetter.textContent = data.department;
                
                const studentStartYear = document.getElementById('student-start-year');
                if (studentStartYear) studentStartYear.textContent = data.startYear;
                
                const studentEndYear = document.getElementById('student-end-year');
                if (studentEndYear) studentEndYear.textContent = data.endYear;
                
                const uniNameSignature = document.getElementById('uni-name-signature');
                if (uniNameSignature) uniNameSignature.textContent = data.university.name;
            }, studentData);
            await letterPage.pdf({
                path: path.join(studentOutputDir, 'official_letter.pdf'),
                format: 'A4',
                printBackground: true
            });
            await letterPage.close();

            delete studentData.photoUrl;
            fs.writeFileSync(path.join(studentOutputDir, 'student_info.json'), JSON.stringify(studentData, null, 2), 'utf8');
            totalFilesProcessed++;
        }
    }

    await browser.close();
    
    if (totalFilesProcessed > 0) {
        console.log(`\n🚀 Success! A total of ${totalFilesProcessed} document sets have been created.`);
    } else {
        console.log('\n🔴 No images were processed.');
    }
}

generateCards().catch(err => {
    console.error('❌ A serious error occurred:', err);
    process.exit(1);
});