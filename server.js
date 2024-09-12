const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const port = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// 讀取 JSON 檔案
const getCourses = () => {
  const data = fs.readFileSync('courses.json', 'utf-8');
  return JSON.parse(data);
};

// 儲存 JSON 檔案
const saveCourses = (data) => {
  fs.writeFileSync('courses.json', JSON.stringify(data, null, 2), 'utf-8');
};

// 取得所有類別
app.get('/categories', (req, res) => {
  const data = getCourses();
  res.json(data.categories);
});

// 新增類別
app.post('/categories', (req, res) => {
  const data = getCourses();
  const newCategory = req.body;
  data.categories.push(newCategory);
  saveCourses(data);
  res.json({ message: '新增成功', categories: data.categories });
});

// 修改類別
app.put('/categories/:name', (req, res) => {
  const data = getCourses();
  const categoryName = req.params.name;
  const updatedCategory = req.body;

  const index = data.categories.findIndex(c => c.name === categoryName);
  if (index !== -1) {
    data.categories[index] = updatedCategory;
    saveCourses(data);
    res.json({ message: '修改成功', categories: data.categories });
  } else {
    res.status(404).json({ message: '類別未找到' });
  }
});

// 刪除類別
app.delete('/categories/:name', (req, res) => {
  const data = getCourses();
  const categoryName = req.params.name;

  const updatedCategories = data.categories.filter(c => c.name !== categoryName);
  data.categories = updatedCategories;
  saveCourses(data);
  res.json({ message: '刪除成功', categories: data.categories });
});

// 子類別 CRUD 操作

// 新增子類別
app.post('/categories/:categoryName/subCategories', (req, res) => {
  const data = getCourses();
  const categoryName = req.params.categoryName;
  const newSubCategory = req.body;

  const category = data.categories.find(c => c.name === categoryName);
  if (category) {
    category.subCategories.push(newSubCategory);
    saveCourses(data);
    res.json({ message: '子類別新增成功', categories: data.categories });
  } else {
    res.status(404).json({ message: '類別未找到' });
  }
});

// 修改子類別
app.put('/categories/:categoryName/subCategories/:subCategoryName', (req, res) => {
  const data = getCourses();
  const categoryName = req.params.categoryName;
  const subCategoryName = req.params.subCategoryName;
  const updatedSubCategory = req.body;

  const category = data.categories.find(c => c.name === categoryName);
  if (category) {
    const subCategoryIndex = category.subCategories.findIndex(sc => sc.name === subCategoryName);
    if (subCategoryIndex !== -1) {
      category.subCategories[subCategoryIndex] = updatedSubCategory;
      saveCourses(data);
      res.json({ message: '子類別修改成功', categories: data.categories });
    } else {
      res.status(404).json({ message: '子類別未找到' });
    }
  } else {
    res.status(404).json({ message: '類別未找到' });
  }
});

// 刪除子類別
app.delete('/categories/:categoryName/subCategories/:subCategoryName', (req, res) => {
  const data = getCourses();
  const categoryName = req.params.categoryName;
  const subCategoryName = req.params.subCategoryName;

  const category = data.categories.find(c => c.name === categoryName);
  if (category) {
    category.subCategories = category.subCategories.filter(sc => sc.name !== subCategoryName);
    saveCourses(data);
    res.json({ message: '子類別刪除成功', categories: data.categories });
  } else {
    res.status(404).json({ message: '類別未找到' });
  }
});

app.listen(port, () => {
  console.log(`伺服器在 http://localhost:${port} 運行`);
});
