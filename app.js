document.addEventListener("DOMContentLoaded", function() {
    let courseData;
    let selectedCategory = null;
    let selectedSubCategory = null;
    const categorySelect = document.getElementById('category');
    const subCategorySelect = document.getElementById('subCategory');
    const timeInput = document.getElementById('time');
    const courseList = document.getElementById('courseList');
    const addCourseBtn = document.getElementById('addCourseBtn');
    const saveJsonBtn = document.getElementById('saveJsonBtn');
    const printPdfBtn = document.getElementById('printPdfBtn');
    const loadJsonInput = document.getElementById('loadJsonInput');
    const loadJsonBtn = document.getElementById('loadJsonBtn');
    const maintainCourseBtn = document.getElementById('maintainCourseBtn');
    const maintainTableBody = document.getElementById('maintainTableBody');
    const saveMaintainBtn = document.getElementById('saveMaintainBtn');
    const addMaintainCourseBtn = document.getElementById('addMaintainCourseBtn');
    const saveJsonMaintainBtn = document.getElementById('saveJsonMaintainBtn');
    let courses = []; // 儲存課程列表
    let editingIndex = -1; // 用來追蹤當前是否在編輯模式

    // 載入JSON課程資料
    fetch('courses.json')
        .then(response => response.json())
        .then(data => {
            courseData = data;
            populateCategorySelect();
        });

    // 填充大類選單
    function populateCategorySelect() {
        courseData.categories.forEach((category, index) => {
            const option = document.createElement('option');
            option.value = index;
            option.textContent = category.name;
            categorySelect.appendChild(option);
        });
    }

    // 當選擇大類時，填充小類選單
    categorySelect.addEventListener('change', function() {
        const categoryIndex = this.value;
        selectedCategory = courseData.categories[categoryIndex];
        subCategorySelect.innerHTML = '<option value="">請選擇小類</option>';
        subCategorySelect.disabled = false;

        selectedCategory.subCategories.forEach((subCategory, index) => {
            const option = document.createElement('option');
            option.value = index;
            option.textContent = subCategory.name;
            subCategorySelect.appendChild(option);
        });
    });

    // 當選擇小類時，保存選擇的小類
    subCategorySelect.addEventListener('change', function() {
        const subCategoryIndex = this.value;
        selectedSubCategory = selectedCategory.subCategories[subCategoryIndex];
    });

    // 新增或修改課程
    addCourseBtn.addEventListener('click', function() {
        if (!selectedCategory || !selectedSubCategory || !timeInput.value) {
            alert('請選擇完整的課程與時間');
            return;
        }

        const course = {
            id: editingIndex === -1 ? courses.length + 1 : courses[editingIndex].id, // 保留或分配節次
            category: selectedCategory.name,
            subCategory: selectedSubCategory.name,
            time: timeInput.value
        };

        if (editingIndex === -1) {
            // 新增課程
            courses.push(course);
        } else {
            // 修改課程
            courses[editingIndex] = course;
            editingIndex = -1; // 重置編輯模式
            addCourseBtn.textContent = "新增課程"; // 恢復按鈕文字
        }

        clearForm();
        renderCourses(); // 渲染課程並保留節次
    });

    // 清空表單
    function clearForm() {
        categorySelect.value = '';
        subCategorySelect.innerHTML = '<option value="">請先選擇大類</option>';
        subCategorySelect.disabled = true;
        timeInput.value = '';
    }

    // 渲染課程列表並分配節次
    function renderCourses() {
        courseList.innerHTML = '';

        courses.forEach((course, index) => {
            const courseItem = document.createElement('div');
            courseItem.className = 'course-item';
            courseItem.innerHTML = `
                <strong>節次 ${course.id}: ${course.category} - ${course.subCategory}</strong><br>
                時間: ${course.time}<br>
                <button onclick="deleteCourse(${index})" class="btn btn-danger btn-sm">刪除</button>
                <button onclick="editCourse(${index})" class="btn btn-warning btn-sm">修改</button>
            `;
            courseList.appendChild(courseItem);
        });
    }

    // 刪除課程，並重新渲染節次
    window.deleteCourse = function(index) {
        courses.splice(index, 1); // 刪除對應的課程
        renderCourses(); // 重新渲染課程列表
    };

    // 編輯課程，保留節次
    window.editCourse = function(index) {
        const course = courses[index];
        categorySelect.value = courseData.categories.findIndex(cat => cat.name === course.category);
        categorySelect.dispatchEvent(new Event('change'));

        setTimeout(() => {
            subCategorySelect.value = selectedCategory.subCategories.findIndex(sub => sub.name === course.subCategory);
            timeInput.value = course.time;
            editingIndex = index; // 設定為編輯模式
            addCourseBtn.textContent = "保存修改"; // 修改按鈕文字
        }, 100);
    };

    // 儲存課表為 JSON 檔案
    saveJsonBtn.addEventListener('click', function() {
        const dataStr = JSON.stringify(courses, null, 2);
        const blob = new Blob([dataStr], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = '課表.json';
        link.click();
        URL.revokeObjectURL(url); // 釋放URL資源
    });

    // 預覽並列印課表為 PDF
    printPdfBtn.addEventListener('click', function() {
        window.print(); // 使用瀏覽器的列印功能
    });

    // 讀取本地 JSON 檔案
    loadJsonBtn.addEventListener('click', function() {
        loadJsonInput.click(); // 模擬點擊隱藏的檔案輸入按鈕
    });

    loadJsonInput.addEventListener('change', function() {
        const file = loadJsonInput.files[0];
        if (!file) {
            alert('請選擇一個 JSON 檔案');
            return;
        }

        const reader = new FileReader();
        reader.onload = function(event) {
            try {
                const json = JSON.parse(event.target.result);
                courses = json;
                renderCourses();
            } catch (e) {
                alert('檔案格式不正確，請上傳有效的 JSON 檔案');
            }
        };
        reader.readAsText(file);
    });

    // 維護課表：載入 courses.json 並顯示在表格中
    maintainCourseBtn.addEventListener('click', function() {
        fetch('courses.json')
            .then(response => response.json())
            .then(data => {
                courses = data; // 將資料載入 courses 陣列
                renderMaintainTable(); // 顯示維護課表內容
                alert('課表已載入，可進行維護');
            })
            .catch(error => {
                console.error('讀取 courses.json 時出錯:', error);
                alert('無法讀取課表資料，請確認檔案是否存在或格式正確');
            });
    });

    // 渲染維護表格
    function renderMaintainTable() {
        maintainTableBody.innerHTML = '';
        courses.forEach((course, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${course.id}</td>
                <td>${course.category}</td>
                <td>${course.subCategory}</td>
                <td>${course.time}</td>
                <td>
                    <button class="btn btn-warning btn-sm" onclick="editMaintainCourse(${index})">修改</button>
                    <button class="btn btn-danger btn-sm" onclick="deleteMaintainCourse(${index})">刪除</button>
                </td>
            `;
            maintainTableBody.appendChild(row);
        });
    }

    // 新增課程
    addMaintainCourseBtn.addEventListener('click', function() {
        const category = document.getElementById('modalCategory').value;
        const subCategory = document.getElementById('modalSubCategory').value;
        const time = document.getElementById('modalTime').value;
        if (!category || !subCategory || !time) {
            alert('請填寫完整的課程資訊');
            return;
        }
        const course = {
            id: courses.length + 1,
            category,
            subCategory,
            time
        };
        courses.push(course);
        renderMaintainTable(); // 重新渲染表格
        alert('課程已新增');
    });

    // 修改課程
    window.editMaintainCourse = function(index) {
        const course = courses[index];
        document.getElementById('modalCategory').value = course.category;
        document.getElementById('modalSubCategory').value = course.subCategory;
        document.getElementById('modalTime').value = course.time;
        editingIndex = index;
    };

    saveMaintainBtn.addEventListener('click', function() {
        if (editingIndex !== -1) {
            const category = document.getElementById('modalCategory').value;
            const subCategory = document.getElementById('modalSubCategory').value;
            const time = document.getElementById('modalTime').value;
            courses[editingIndex] = { ...courses[editingIndex], category, subCategory, time };
            renderMaintainTable();
            editingIndex = -1;
            alert('課程已修改');
        } else {
            alert('未選擇課程進行修改');
        }
    });

    // 刪除課程
    window.deleteMaintainCourse = function(index) {
        courses.splice(index, 1);
        renderMaintainTable();
        alert('課程已刪除');
    };

    // 儲存修改到 courses.json
    saveJsonMaintainBtn.addEventListener('click', function() {
        const dataStr = JSON.stringify(courses, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'courses.json';
        link.click();
        URL.revokeObjectURL(url);
        alert('課表已儲存至 courses.json');
    });
});
