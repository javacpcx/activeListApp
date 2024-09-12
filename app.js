document.addEventListener("DOMContentLoaded", function() {
    let courseData;
    let courses = [];
    let editingIndex = -1;

    const categorySelect = document.getElementById('category');
    const subCategorySelect = document.getElementById('subCategory');
    const timeInput = document.getElementById('time');
    const courseList = document.getElementById('courseList');
    const addCourseBtn = document.getElementById('addCourseBtn');
    const saveJsonBtn = document.getElementById('saveJsonBtn');
    const printPdfBtn = document.getElementById('printPdfBtn');
    const loadJsonBtn = document.getElementById('loadJsonBtn');
    const loadJsonInput = document.getElementById('loadJsonInput');

    // Modal 的元素
    const modalCategorySelect = document.getElementById('modalCategory');
    const modalSubCategorySelect = document.getElementById('modalSubCategory');
    const modalTimeInput = document.getElementById('modalTime');
    const editModal = new bootstrap.Modal(document.getElementById('editModal'), { keyboard: false });
    const saveEditBtn = document.getElementById('saveEditBtn');

    // 載入JSON課程資料
    fetch('./courses.json')
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
            modalCategorySelect.appendChild(option.cloneNode(true)); // 同步到 modal 的選單
        });
    }

    // 當選擇大類時，填充小類選單
    categorySelect.addEventListener('change', function() {
        updateSubCategories(categorySelect, subCategorySelect);
    });

    // Modal 中的大類選單變更時，更新小類選單
    modalCategorySelect.addEventListener('change', function() {
        updateSubCategories(modalCategorySelect, modalSubCategorySelect);
    });

    // 更新小類選單
    function updateSubCategories(categoryElement, subCategoryElement) {
        const categoryIndex = categoryElement.value;
        const selectedCategory = courseData.categories[categoryIndex];
        subCategoryElement.innerHTML = '<option value="">請選擇小類</option>';

        selectedCategory.subCategories.forEach(subCategory => {
            const option = document.createElement('option');
            option.value = subCategory.name;
            option.textContent = subCategory.name;
            subCategoryElement.appendChild(option);
        });
        subCategoryElement.disabled = false;
    }

    // 新增課程
    addCourseBtn.addEventListener('click', function() {
        if (!categorySelect.value || !subCategorySelect.value || !timeInput.value) {
            alert('請選擇完整的課程與時間');
            return;
        }

        const course = {
            id: editingIndex === -1 ? courses.length + 1 : courses[editingIndex].id,
            category: courseData.categories[categorySelect.value].name,
            subCategory: subCategorySelect.value,
            time: timeInput.value
        };

        if (editingIndex === -1) {
            courses.push(course);
        } else {
            courses[editingIndex] = course;
            editingIndex = -1;
            addCourseBtn.textContent = "新增課程";
        }

        clearForm();
        renderCourses();
    });

    // 清空表單
    function clearForm() {
        categorySelect.value = '';
        subCategorySelect.innerHTML = '<option value="">請先選擇大類</option>';
        subCategorySelect.disabled = true;
        timeInput.value = '';
    }

    // 渲染課程列表
    function renderCourses() {
        courseList.innerHTML = '';
        courses.forEach((course, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <th scope="row">${course.id}</th>
                <td>${course.category}</td>
                <td>${course.subCategory}</td>
                <td>${course.time}</td>
                <td>
                    <button class="btn btn-warning btn-sm" onclick="editCourse(${index})">修改</button>
                    <button class="btn btn-danger btn-sm" onclick="deleteCourse(${index})">刪除</button>
                </td>
            `;
            courseList.appendChild(row);
        });
    }

    // 編輯課程
    window.editCourse = function(index) {
        const course = courses[index];
        const categoryIndex = courseData.categories.findIndex(cat => cat.name === course.category);
        modalCategorySelect.value = categoryIndex;

        // 手動觸發 change 事件來更新小類選單
        modalCategorySelect.dispatchEvent(new Event('change'));

        // 等小類選單填充完後，選擇對應的小類
        setTimeout(() => {
            modalSubCategorySelect.value = course.subCategory;
        }, 100);

        modalTimeInput.value = course.time;
        editingIndex = index;
        editModal.show(); // 打開 Modal
    };

    // 保存修改
    saveEditBtn.addEventListener('click', function() {
        if (!modalCategorySelect.value || !modalSubCategorySelect.value || !modalTimeInput.value) {
            alert('請填寫完整的資料');
            return;
        }

        const course = {
            id: courses[editingIndex].id,
            category: courseData.categories[modalCategorySelect.value].name,
            subCategory: modalSubCategorySelect.value,
            time: modalTimeInput.value
        };

        courses[editingIndex] = course;
        renderCourses(); // 更新表格
        editModal.hide(); // 關閉 Modal
    });

    // 刪除課程
    window.deleteCourse = function(index) {
        courses.splice(index, 1);
        renderCourses();
    };

    // 儲存 JSON 檔案
    saveJsonBtn.addEventListener('click', function() {
        const dataStr = JSON.stringify(courses, null, 2);
        const blob = new Blob([dataStr], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'courses.json';
        link.click();
        URL.revokeObjectURL(url);
    });

    // 預覽並列印 PDF
    printPdfBtn.addEventListener('click', function() {
        window.print();
    });

    // 讀取 JSON 檔案
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
                renderCourses(); // 重新渲染課程列表
            } catch (e) {
                alert('檔案格式不正確，請上傳有效的 JSON 檔案');
            }
        };
        reader.readAsText(file);
    });
});
