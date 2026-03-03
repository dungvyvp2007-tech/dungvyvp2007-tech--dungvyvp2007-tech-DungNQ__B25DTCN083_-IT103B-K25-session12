
let students = [];

function validateStudent(data, isUpdate = false) {
  const errors = [];

  if (!isUpdate || data.id !== undefined) {
    if (!data.id || typeof data.id !== "string") {
      errors.push("ID phải là string và không được rỗng");
    }
  }

  if (!isUpdate || data.name !== undefined) {
    if (!data.name || typeof data.name !== "string") {
      errors.push("Name phải là string và không được rỗng");
    }
  }

  if (!isUpdate || data.age !== undefined) {
    if (
      typeof data.age !== "number" ||
      !Number.isInteger(data.age) ||
      data.age < 16 ||
      data.age > 60
    ) {
      errors.push("Age phải là số nguyên từ 16 đến 60");
    }
  }

  if (!isUpdate || data.gpa !== undefined) {
    if (
      typeof data.gpa !== "number" ||
      data.gpa < 0 ||
      data.gpa > 10
    ) {
      errors.push("GPA phải từ 0.0 đến 10.0");
    }
  }

  if (!isUpdate || data.status !== undefined) {
    if (data.status !== "active" && data.status !== "inactive") {
      errors.push('Status phải là "active" hoặc "inactive"');
    }
  }

  return errors;
}


function createStudent(payload) {
  const errors = validateStudent(payload);
  if (errors.length) {
    console.log("CREATE FAILED:", errors);
    return;
  }

  if (students.some(s => s.id === payload.id)) {
    console.log("CREATE FAILED: ID đã tồn tại");
    return;
  }

  students.push({
    ...payload,
    createdAt: Date.now(),
    updatedAt: null,
    deletedAt: null
  });

  console.log("CREATE SUCCESS:", payload.id);
}

function updateStudent(id, updateData) {
  const student = students.find(s => s.id === id);
  if (!student) {
    console.log("UPDATE FAILED: Không tìm thấy sinh viên");
    return;
  }

  const errors = validateStudent(updateData, true);
  if (errors.length) {
    console.log("UPDATE FAILED:", errors);
    return;
  }

  Object.assign(student, updateData);
  student.updatedAt = Date.now();

  console.log("UPDATE SUCCESS:", id);
}

function softDeleteStudent(id, confirm) {
  const student = students.find(s => s.id === id);
  if (!student) {
    console.log("SOFT DELETE FAILED: Không tìm thấy");
    return;
  }

  if (!confirm) {
    console.log("SOFT DELETE CANCELLED");
    return;
  }

  student.status = "inactive";
  student.deletedAt = Date.now();
  student.updatedAt = Date.now();

  console.log("SOFT DELETE SUCCESS:", id);
}

function restoreStudent(id) {
  const student = students.find(s => s.id === id);
  if (!student) {
    console.log("RESTORE FAILED: Không tìm thấy");
    return;
  }

  student.status = "active";
  student.deletedAt = null;
  student.updatedAt = Date.now();

  console.log("RESTORE SUCCESS:", id);
}


function viewStudents(options) {
  console.log("\n=== PIPELINE MODE ===");

  let data = [...students]; 


  if (options.search) {
    data = data.filter(s =>
      s.name.toLowerCase().includes(options.search.toLowerCase())
    );
  }


  if (options.status) {
    data = data.filter(s => s.status === options.status);
  }


  if (options.sort === "asc") {
    data.sort((a, b) => a.gpa - b.gpa);
  }
  if (options.sort === "desc") {
    data.sort((a, b) => b.gpa - a.gpa);
  }


  const pageSize = 5;
  const totalPages = Math.ceil(data.length / pageSize) || 1;
  const page = options.page || 1;

  const start = (page - 1) * pageSize;
  const result = data.slice(start, start + pageSize);

  console.log(`Trang ${page}/${totalPages}`);
  console.log(`Tổng bản ghi: ${data.length}`);
  console.log(result);
}


function analyticsDashboard() {
  console.log("\n=== ANALYTICS DASHBOARD ===");

  const overview = students.reduce(
    (acc, s) => {
      acc.total++;
      if (s.status === "active") acc.active++;
      if (s.status === "inactive") acc.inactive++;
      return acc;
    },
    { total: 0, active: 0, inactive: 0 }
  );

  const avgGPA =
    students.reduce((sum, s) => sum + s.gpa, 0) /
    (students.length || 1);

  const risk = students.reduce(
    (acc, s) => {
      if (s.gpa === 0) acc.zeroGPA.push(s);
      if (s.gpa < 3) acc.lowGPA.push(s);
      return acc;
    },
    { zeroGPA: [], lowGPA: [] }
  );

  const distribution = students.reduce((acc, s) => {
    let level = "Average";
    if (s.gpa >= 8) level = "Excellent";
    else if (s.gpa >= 6.5) level = "Good";
    else if (s.gpa >= 5) level = "Fair";
    else level = "Weak";

    acc[level] = (acc[level] || 0) + 1;
    return acc;
  }, {});

  const topGPA = [...students]
    .sort((a, b) => b.gpa - a.gpa)
    .slice(0, 5);

  const youngest = [...students]
    .sort((a, b) => a.age - b.age)
    .slice(0, 5);

  console.log("Overview:", overview);
  console.log("Average GPA:", avgGPA.toFixed(2));
  console.log("Top 5 GPA:", topGPA);
  console.log("Top 5 Youngest:", youngest);
  console.log("Risk Report:", risk);
  console.log("Academic Distribution:", distribution);
}


function menu(action, payload) {
  console.log("\n==== STUDENT MANAGER ADVANCED ====");

  switch (action) {
    case "Create Student":
      createStudent(payload);
      break;

    case "Update Student":
      updateStudent(payload.id, payload.updateData);
      break;

    case "Soft Delete Student":
      softDeleteStudent(payload.id, payload.confirm);
      break;

    case "Restore Student":
      restoreStudent(payload.id);
      break;

    case "View Students":
      viewStudents(payload);
      break;

    case "Analytics Dashboard":
      analyticsDashboard();
      break;

    case "Exit":
      console.log("Exit chương trình");
      break;

    default:
      console.log("Invalid Option");
  }
}


menu("Create Student", {
  id: "S01",
  name: "Nguyen Van A",
  age: 20,
  gpa: 8.5,
  status: "active"
});

menu("Create Student", {
  id: "S02",
  name: "Tran Thi B",
  age: 19,
  gpa: 2.5,
  status: "active"
});

menu("Create Student", {
  id: "S03",
  name: "Le Van C",
  age: 22,
  gpa: 0,
  status: "active"
});

menu("Soft Delete Student", {
  id: "S02",
  confirm: true
});

menu("View Students", {
  search: "",
  status: "",
  sort: "desc",
  page: 1
});

menu("Analytics Dashboard");

menu("Exit");