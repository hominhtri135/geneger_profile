import asyncio
import datetime
import json
import os
import random
from pathlib import Path

import aiofiles
from pyppeteer import launch

# --- Dữ liệu và các hàm tạo dữ liệu không đổi ---
# (Giữ nguyên các phần khai báo universities, names, programs, và hàm create_realistic_indian_student)
# --- Dữ liệu Đại học Ấn Độ ---
universities = [
    {
        "name": "IIM Bangalore",
        "logo_url": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcThnWEFNAwfrO_g7WZj4XMyiecwYFcsObAMFw&s",
    },
]

# --- Danh sách Tên ---
indian_male_first_names = [
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
]
indian_female_first_names = [
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
]
indian_last_names = [
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
]
programs = {
    "Engineering": {
        "prefix": "BTECH",
        "departments": [
            "Computer Science",
            "Mechanical Engineering",
            "Electrical Engineering",
            "Civil Engineering",
        ],
    },
    "Arts": {
        "prefix": "BA",
        "departments": ["History", "Economics", "Political Science", "Sociology"],
    },
    "Science": {
        "prefix": "BSC",
        "departments": ["Physics", "Chemistry", "Mathematics", "Biology"],
    },
}


def create_realistic_indian_student(gender):
    university = random.choice(universities)
    age = 18 + random.randint(0, 6)
    current_year = datetime.datetime.now().year
    birth_year = current_year - age
    birth_month = random.randint(1, 12)
    birth_day = random.randint(1, 28)
    dob = f"{birth_year}-{str(birth_month).zfill(2)}-{str(birth_day).zfill(2)}"

    program_key = random.choice(list(programs.keys()))
    program_info = programs[program_key]
    department = random.choice(program_info["departments"])

    class_prefix = program_info["prefix"]
    start_year = current_year - random.randint(0, 3)
    end_year = start_year + 4
    course = f"{start_year} - {end_year}"
    student_class = f"{class_prefix}-{department[:3].upper()}-{start_year}"
    random_digits = random.randint(1000000, 9999999)
    student_id = f"{class_prefix[:2]}{start_year}.{random_digits}"

    if gender == "male":
        first_name = random.choice(indian_male_first_names)
    else:
        first_name = random.choice(indian_female_first_names)
    last_name = random.choice(indian_last_names)
    name = f"{first_name} {last_name}"
    valid_until = f"15/07/{end_year}"

    return {
        "name": name,
        "dob": dob,
        "course": course,
        "class": student_class,
        "department": department,
        "validUntil": valid_until,
        "studentId": student_id,
        "gender": gender,
        "university": university,
        "startYear": start_year,
        "endYear": end_year,
    }


# --- Các hàm generate không đổi ---
async def generate_student_card(browser, student_data, student_output_dir):
    page = await browser.newPage()
    try:
        await page.goto(f"file://{Path(__file__).parent.resolve()}/index.html", waitUntil="domcontentloaded")
        await page.evaluate(
            """(data) => {
            document.getElementById('uni-logo').src = data.university.logo_url;
            document.getElementById('uni-name').textContent = data.university.name;
            document.getElementById('student-photo').src = data.photoUrl;
            document.getElementById('student-name').textContent = data.name;
            document.getElementById('student-dob').textContent = data.dob;
            document.getElementById('student-course').textContent = data.course;
            document.getElementById('student-class').textContent = data.class;
            document.getElementById('student-department').textContent = data.department;
            document.getElementById('valid-until').textContent = data.validUntil;
            document.getElementById('student-id').textContent = data.studentId;
        }""",
            student_data,
        )
        card_element = await page.querySelector(".student-card-container")
        if card_element:
            await card_element.screenshot(
                {
                    "path": os.path.join(student_output_dir, "student_card.png"),
                    "omitBackground": True,
                }
            )
    finally:
        await page.close()


async def generate_fee_receipt(browser, student_data, student_output_dir):
    page = await browser.newPage()
    try:
        await page.goto(f"file://{Path(__file__).parent.resolve()}/fee_receipt.html", waitUntil="domcontentloaded")
        await page.evaluate(
            """(data) => {
            document.getElementById('uni-logo-receipt').src = data.university.logo_url;
            document.getElementById('uni-name-receipt').textContent = data.university.name;
            document.getElementById('receipt-id').textContent = `FEE-REC-${Math.floor(Math.random() * 100000000)}`;
            document.getElementById('receipt-date').textContent = new Date().toLocaleDateString('en-GB');
            document.getElementById('student-name-receipt').textContent = data.name;
            document.getElementById('student-id-receipt').textContent = data.studentId;
            document.getElementById('student-course-receipt').textContent = data.course;
            document.getElementById('student-department-receipt').textContent = data.department;
            const feeAmount = (Math.floor(Math.random() * (20000 - 5000 + 1)) + 5000).toLocaleString('en-IN');
            const feeAmountElements = document.querySelectorAll('#fee-amount');
            feeAmountElements.forEach(el => el.textContent = feeAmount);
        }""",
            student_data,
        )
        await page.pdf(
            {
                "path": os.path.join(student_output_dir, "registration_fee_receipt.pdf"),
                "format": "A4",
                "printBackground": True,
            }
        )
    finally:
        await page.close()


async def generate_official_letter(browser, student_data, student_output_dir):
    page = await browser.newPage()
    try:
        await page.goto(f"file://{Path(__file__).parent.resolve()}/official_letter.html", waitUntil="domcontentloaded")
        await page.evaluate(
            """(data) => {
            const today = new Date();
            const formattedDate = today.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
            document.getElementById('uni-logo-letter').src = data.university.logo_url;
            document.getElementById('uni-name-letter').textContent = data.university.name;
            document.getElementById('letter-date').textContent = formattedDate;
            document.getElementById('student-name-letter').textContent = data.name;
            document.getElementById('student-id-letter').textContent = data.studentId;
            document.getElementById('student-course-letter').textContent = data.course;
            document.getElementById('student-department-letter').textContent = data.department;
            document.getElementById('student-start-year').textContent = data.startYear;
            document.getElementById('student-end-year').textContent = data.endYear;
            document.getElementById('uni-name-signature').textContent = data.university.name;
        }""",
            student_data,
        )
        await page.pdf(
            {
                "path": os.path.join(student_output_dir, "official_letter.pdf"),
                "format": "A4",
                "printBackground": True,
            }
        )
    finally:
        await page.close()


def generate_autofill_script(data):
    # Hàm này không thay đổi
    first_name, last_name = data["name"].split(" ", 1)
    dob_date = datetime.datetime.strptime(data["dob"], "%Y-%m-%d")
    day = dob_date.strftime("%d")
    month = str(int(dob_date.strftime("%m")))
    year = dob_date.strftime("%Y")
    # ... (phần còn lại của script)
    return f"""
(async () => {{
  const data = {json.dumps(data, indent=2)};

  const delay = ms => new Promise(r => setTimeout(r, ms));
  const set = async (sel, val) => {{
    const el = document.querySelector(sel);
    if (!el) return;
    const setVal = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set;
    setVal.call(el, val);
    el.dispatchEvent(new Event("input", {{ bubbles: true }}));
    el.dispatchEvent(new Event("change", {{ bubbles: true }}));
    el.dispatchEvent(new Event("blur", {{ bubbles: true }}));
    await delay(150);
  }};

  const selectFromDropdown = async (inputSelector, menuSelector, matchText) => {{
    const el = document.querySelector(inputSelector);
    if (!el) return;
    el.focus();
    el.click();
    await delay(500);
    el.dispatchEvent(new KeyboardEvent('keydown', {{ key: 'ArrowDown', bubbles: true }}));
    await delay(800);
    const options = document.querySelectorAll(`${{menuSelector}} [role="option"]`);
    const match = [...options].find(opt => opt.innerText.toLowerCase().includes(matchText.toLowerCase()));
    match?.click();
    await delay(300);
  }};

  // 1. Chọn quốc gia trước
  const selectCountry = async () => {{
    const input = document.querySelector('#sid-country');
    if (!input) return;
    input.focus();
    input.click();
    await delay(400);
    input.dispatchEvent(new KeyboardEvent('keydown', {{ key: 'ArrowDown', bubbles: true }}));
    await delay(800);
    const options = document.querySelectorAll('#sid-country-menu [role="option"]');
    const match = [...options].find(opt => opt.innerText.toLowerCase().includes("ấn độ"));
    match?.click();
    await delay(400);
  }};

  await selectCountry();

  // 2. Điền tên trường đại học và chờ chọn
  const pasteSchool = async (val) => {{
    const el = document.querySelector('#sid-college-name');
    if (!el) return;
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(el, val);
    el.dispatchEvent(new Event('input', {{ bubbles: true }}));
    await delay(2000); // đợi danh sách load xong
    document.querySelector('#sid-college-name-menu [role="option"]')?.click();
    await delay(500);
  }};

  await pasteSchool(data.university.name);

  // 3. Điền các trường còn lại
  const firstName = "{first_name}";
  const lastName = "{last_name}";

  await set('#sid-first-name', firstName);
  await set('#sid-last-name', lastName);
  await set('#sid-birthdate-day', "{day}");
  await set('#sid-birthdate-year', "{year}");


  // 4. Chọn tháng sinh
  const selectMonth = async () => {{
    const el = document.querySelector('#sid-birthdate__month');
    if (!el) return;
    el.focus();
    el.click();
    await delay(400);
    el.dispatchEvent(new KeyboardEvent('keydown', {{ key: 'ArrowDown', bubbles: true }}));
    await delay(500);
    [...document.querySelectorAll('#sid-birthdate__month-menu [role="option"]')]
      .find(o => o.innerText.toLowerCase().includes("Tháng {month}".toLowerCase()))?.click();
    await delay(300);
  }};

  await selectMonth();

  console.log("✅ Form đã được điền từ JSON cho: " + data.name);
}})();
"""


# *** BẮT ĐẦU THAY ĐỔI ***
# Tách hàm ghi file thành 2 hàm riêng biệt
async def write_js_file(student_output_dir, autofill_script):
    """Hàm bất đồng bộ chỉ để ghi tệp JS."""
    js_path = os.path.join(student_output_dir, "auto_fill_script.js")
    async with aiofiles.open(js_path, "w", encoding="utf-8") as f:
        await f.write(autofill_script)


async def write_json_file(student_output_dir, student_data):
    """Hàm bất đồng bộ chỉ để ghi tệp JSON."""
    student_info_for_json = student_data.copy()
    del student_info_for_json["photoUrl"]
    json_path = os.path.join(student_output_dir, "student_info.json")
    async with aiofiles.open(json_path, "w", encoding="utf-8") as f:
        await f.write(json.dumps(student_info_for_json, indent=2))


async def process_student_card(browser, gender, photo_file, images_dir, output_dir, sequence_number, semaphore):
    async with semaphore:
        try:
            student_data = create_realistic_indian_student(gender)
            student_data["photoUrl"] = f"file://{os.path.join(images_dir, photo_file)}"

            padded_sequence = str(sequence_number).zfill(3)
            student_output_dir = os.path.join(
                output_dir,
                f"{padded_sequence}_{student_data['university']['name'].replace(' ', '_')}_{student_data['studentId']}",
            )
            os.makedirs(student_output_dir, exist_ok=True)

            print(f"      🔥 Task {sequence_number}: Bắt đầu xử lý 5 tác vụ song song...")

            autofill_script = generate_autofill_script(student_data)

            # Chạy chính xác 5 tác vụ song song
            await asyncio.gather(
                generate_student_card(browser, student_data, student_output_dir),
                generate_fee_receipt(browser, student_data, student_output_dir),
                generate_official_letter(browser, student_data, student_output_dir),
                write_js_file(student_output_dir, autofill_script),
                write_json_file(student_output_dir, student_data),
            )

            end_time = datetime.datetime.now()
            print(f"   ✅ [{end_time.isoformat()}] Hoàn thành task {sequence_number}")
            return 1
        except Exception as e:
            print(f"   ❌ [{datetime.datetime.now().isoformat()}] Lỗi task {sequence_number}: {e}")
            return 0


# *** KẾT THÚC THAY ĐỔI ***


async def generate_cards():
    # Hàm này không thay đổi, vẫn giữ nguyên logic và đường dẫn Chrome
    base_images_dir = Path(__file__).parent / "images"
    output_dir = Path(__file__).parent / "output"
    MAX_CONCURRENT = 5

    print("🚀 Student Card Generator - Interactive Mode (Optimized with Python Asyncio)")
    print("============================================")

    try:
        total_count = int(input("💬 Nhập số lượng thẻ sinh viên cần tạo: "))
        if total_count <= 0:
            raise ValueError
    except ValueError:
        print("❌ Số lượng không hợp lệ!")
        return

    target_gender = "female"

    now = datetime.datetime.now()
    timestamp = now.strftime("%H%M%S_%d%m%Y")
    session_output_dir = output_dir / timestamp

    if not base_images_dir.exists():
        print('❌ "images" directory not found. Creating a sample directory structure...')
        (base_images_dir / "male").mkdir(parents=True, exist_ok=True)
        (base_images_dir / "female").mkdir(parents=True, exist_ok=True)
        print('✅ Created "images/male" and "images/female" directories. Please add photos and run again.')
        return

    output_dir.mkdir(exist_ok=True)
    session_output_dir.mkdir(exist_ok=True)

    available_images = []
    target_dir = base_images_dir / target_gender
    if target_dir.exists():
        images = [f for f in os.listdir(target_dir) if f.lower().endswith((".jpg", ".jpeg", ".png", ".gif"))]
        for img in images:
            available_images.append({"gender": target_gender, "file": img, "dir": str(target_dir)})

    if not available_images:
        print(f"❌ Không tìm thấy ảnh nào trong thư mục {target_gender}!")
        return

    print(f"\n✅ Tìm thấy {len(available_images)} ảnh. Bắt đầu tạo {total_count} thẻ sinh viên...")
    print(f"📁 Kết quả sẽ được lưu trong: {session_output_dir}")
    print("🌐 Đang khởi động browser (tối ưu cho hiệu suất)...")

    executable_path = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"

    browser = await launch(
        executablePath=executable_path, headless=True, args=["--no-sandbox", "--disable-setuid-sandbox"]
    )

    all_tasks_data = []
    for i in range(total_count):
        image_info = available_images[i % len(available_images)]
        all_tasks_data.append(
            {
                "gender": image_info["gender"],
                "photo_file": image_info["file"],
                "images_dir": image_info["dir"],
                "sequence_number": i + 1,
            }
        )

    start_time = datetime.datetime.now()
    semaphore = asyncio.Semaphore(MAX_CONCURRENT)

    tasks_to_run = [
        process_student_card(
            browser,
            task["gender"],
            task["photo_file"],
            task["images_dir"],
            session_output_dir,
            task["sequence_number"],
            semaphore,
        )
        for task in all_tasks_data
    ]

    results = await asyncio.gather(*tasks_to_run)
    total_files_processed = sum(results)

    await browser.close()

    total_time = (datetime.datetime.now() - start_time).total_seconds()

    print("\n" + "=" * 60)
    print("📊 BÁO CÁO HIỆU SUẤT:")
    print(f"⏱️  Tổng thời gian: {total_time:.1f}s")
    if total_count > 0 and total_time > 0:
        print(f"⚡ Tốc độ trung bình: {(total_files_processed / total_time):.1f} files/giây")
        print(f"🕒 Thời gian mỗi file: {(total_time / total_count):.2f}s")
    print(f"🔄 Xử lý song song: {MAX_CONCURRENT} tác vụ cùng lúc")
    print("=" * 60)

    if total_files_processed > 0:
        print(f"🚀 THÀNH CÔNG! Đã tạo {total_files_processed}/{total_count} bộ tài liệu sinh viên.")
        print(f"📁 Kết quả được lưu trong thư mục: {session_output_dir}")
        print(f"📅 Session timestamp: {timestamp}")
        print("\n📋 Mỗi sinh viên có:")
        print("   - student_card.png (Thẻ sinh viên)")
        print("   - registration_fee_receipt.pdf (Biên lai phí)")
        print("   - official_letter.pdf (Thư chính thức)")
        print("   - student_info.json (Thông tin JSON)")
        print("   - auto_fill_script.js (Script tự động điền form)")

        if total_files_processed < total_count:
            print(f"\n⚠️  Lưu ý: {total_count - total_files_processed} file không được xử lý do lỗi.")
    else:
        print("\n🔴 Không có file nào được xử lý thành công.")
    print("=" * 60)


if __name__ == "__main__":
    asyncio.run(generate_cards())
