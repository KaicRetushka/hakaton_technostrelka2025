const photoMark = document.querySelector('#photo_mark_input');
const gallery = document.querySelector('#gallery');
const saveChange = document.querySelector('#saveChange');
let currentFiles = []; // Храним текущие файлы

// Функция для обновления FormData
function updateFormData() {
    const formData = new FormData();
    
    // Добавляем файлы с правильным ключом 'photos'
    currentFiles.forEach(file => {
        formData.append('photos', file);
    });
    
    return formData;
}

function myFunc() {
    const files = Array.from(photoMark.files);
    currentFiles = files; // Обновляем текущие файлы
    gallery.innerHTML = '';

    files.forEach((file, i) => {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            const container = document.createElement('div');
            container.style.position = 'relative';
            container.style.display = 'inline-block';
            
            const img = document.createElement('img');
            img.src = e.target.result;
            img.style.width = '100px';
            img.style.height = '100px';
            img.style.margin = '15px';
            
            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = '×';
            deleteBtn.addEventListener('click', () => {
                // Удаляем файл из массива
                currentFiles = currentFiles.filter((_, index) => index !== i);
                container.remove();
            });
            
            container.appendChild(img);
            container.appendChild(deleteBtn);
            gallery.appendChild(container);
        };
        
        reader.readAsDataURL(file);
    });
}

async function changeMark() {
    const id = document.querySelector('#info_id').value;
    const title = document.querySelector('#info_title').value;
    const x_coor = document.querySelector('#info_x_coor').value;
    const y_coor = document.querySelector('#info_y_coor').value;
    const description = document.querySelector('#info_description').value;
    
    try {
        const formData = updateFormData(); // Актуальные файлы
        
        // Параметры ТОЛЬКО в URL, файлы - в FormData
        const response = await fetch(
            `http://127.0.0.1:8000/metka/${id}/?title=${title}&x_coor=${x_coor}&y_coor=${y_coor}&description=${description}`, 
            {
                method: 'PUT',
                body: formData // Только файлы
            }
        );
        
        if (!response.ok) throw new Error('Ошибка сервера');
        const result = await response.json();
        console.log('Успех:', result);
    } catch (error) {
        console.error('Ошибка:', error);
    }
}

// Инициализация
photoMark.addEventListener('change', myFunc);
saveChange.addEventListener('click', changeMark);