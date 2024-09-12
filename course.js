// 模擬從後端獲取的 JSON 資料
let data = {
    "categories": [
      {
        "name": "藝術",
        "subCategories": [
          { "name": "繪畫", "description": "學習基礎繪畫技巧" },
          { "name": "雕塑", "description": "探索雕塑的藝術形式" }
        ]
      },
      {
        "name": "理科",
        "subCategories": [
          { "name": "數學", "description": "學習代數與幾何" },
          { "name": "物理", "description": "探索物理的基本原理" }
        ]
      }
    ]
  };
  
  // 初始化，將資料顯示在頁面上
  function renderCategories() {
      const container = document.getElementById('categories-container');
      container.innerHTML = ''; // 清空內容
  
      data.categories.forEach((category, index) => {
          const categoryDiv = document.createElement('div');
          categoryDiv.classList.add('category');
  
          let subCategoriesHTML = '<ul>';
          category.subCategories.forEach(sub => {
              subCategoriesHTML += `<li>${sub.name} - ${sub.description}</li>`;
          });
          subCategoriesHTML += '</ul>';
  
          categoryDiv.innerHTML = `
              <h3>${category.name}</h3>
              ${subCategoriesHTML}
              <div class="actions">
                  <button onclick="deleteCategory(${index})">刪除</button>
                  <button onclick="editCategory(${index})">修改</button>
              </div>
          `;
  
          container.appendChild(categoryDiv);
      });
  }
  
  // 新增分類
  function addCategory() {
      const categoryName = document.getElementById('newCategoryName').value;
      if (categoryName) {
          data.categories.push({ name: categoryName, subCategories: [] });
          renderCategories(); // 重新渲染頁面
          document.getElementById('newCategoryName').value = ''; // 清空輸入框
      }
  }
  
  // 刪除分類
  function deleteCategory(index) {
      data.categories.splice(index, 1); // 刪除對應的分類
      renderCategories(); // 重新渲染頁面
  }
  
  // 修改分類
  function editCategory(index) {
      const newCategoryName = prompt("請輸入新的分類名稱", data.categories[index].name);
      if (newCategoryName) {
          data.categories[index].name = newCategoryName;
          renderCategories(); // 重新渲染頁面
      }
  }
  
  // 初始化頁面
  renderCategories();

  function saveDataToServer() {
    fetch('/categories', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    })
    .then(response => response.text())
    .then(message => {
        console.log(message);
    });
}

  