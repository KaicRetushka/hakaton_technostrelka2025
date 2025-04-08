const photoMark = document.querySelector('#photo_mark_input')
const gallery = document.querySelector('#gallery')
let saveChange = document.querySelector('#saveChange')
const formData = new FormData()
let myMap
let id = document.querySelector('#info_id').value
let title = document.querySelector('#info_title').value
let title_orig = document.querySelector('#info_title_orig').value
let x_coor_orig = document.querySelector('#info_x_coor').value
let y_coor_orig = document.querySelector('#info_y_coor').value
let x_coor = x_coor_orig
let y_coor = y_coor_orig
let description = document.querySelector('#info_description').value
let changeCoords = document.querySelector('#changeCoords')
let change = false
let mapClickListener = null; // Ссылка на обработчик кликов
let cancelChange = document.querySelector('#cancel_change')




ymaps.ready(function () {
    
    myMap = new ymaps.Map("map", {
        center: [55.76, 37.64],
        zoom: 10
    })

    myMap.geoObjects.removeAll();

    const placemark_orig = new ymaps.Placemark(
        [x_coor_orig, y_coor_orig],
        {
            hintContent: title_orig
        },
        {
            preset: "islands#blackDotIcon"
        }
    )  

    myMap.geoObjects.add(placemark_orig)



    changeCoords.addEventListener('click', () => {

        change = !change

        if (change) {
            // Режим изменения координат - добавляем обработчик
            mapClickListener = function(e) {
                const coords = e.get('coords');
                x_coor = coords[0];
                y_coor = coords[1];
                
                // Удаляем все метки и добавляем новую
                myMap.geoObjects.removeAll();
                const placemark = new ymaps.Placemark(
                    coords,
                    { hintContent: title },
                    { preset: "islands#blackDotIcon" }
                );
                myMap.geoObjects.add(placemark);
            };
            
            myMap.events.add('click', mapClickListener);
            changeCoords.textContent = 'Установить точку';
            cancelChange.hidden = false
        } else {
            // Режим отмены - удаляем обработчик
            if (mapClickListener) {
                myMap.events.remove('click', mapClickListener);
                mapClickListener = null;
                cancelChange.hidden = true
            }
            changeCoords.textContent = 'Поменять координаты';
        }
    })

    cancelChange.addEventListener('click', () => {
        myMap.geoObjects.removeAll()

        const placemark_orig = new ymaps.Placemark(
            [x_coor_orig, y_coor_orig],
            {
                hintContent: title_orig
            },
            {
                preset: "islands#blackDotIcon"
            }
        )  

        myMap.geoObjects.add(placemark_orig)

        cancelChange.hidden = true

        changeCoords.textContent = 'Поменять координаты'
    })
    
})





function myFunc() {
    const files = photoMark.files
    const reader = []
    
    gallery.innerHTML = ''

    for (let i = 0; i < files.length; i++){
        
        const reader = new FileReader()
        
        formData.append(`photos`, files[i])

        reader.onload = function(e) {
            const imgElement = document.createElement('img')
            imgElement.src = e.target.result
            imgElement.style.width = '100px'
            imgElement.style.height = '100px'
            imgElement.style.margin = '15px'
            imgElement.style.objectFit = 'cover'
            
            // Добавляем кнопку удаления
            const container = document.createElement('div')
            container.style.position = 'relative'
            container.style.display = 'inline-block'
            
            const deleteBtn = document.createElement('button')
            deleteBtn.textContent = '×'
            deleteBtn.style.position = 'absolute'
            deleteBtn.style.top = '0'
            deleteBtn.style.right = '0'
            deleteBtn.style.background = 'red'
            deleteBtn.style.color = 'white'
            deleteBtn.style.border = 'none'
            deleteBtn.style.borderRadius = '50%'
            deleteBtn.style.cursor = 'pointer'
            
            deleteBtn.addEventListener('click', () => {
                container.remove()
            })
            
            container.appendChild(imgElement)
            container.appendChild(deleteBtn)
            gallery.appendChild(container)
        };
        
        reader.readAsDataURL(files[i])
        
        console.log(files[i])
    }

    

    

}

async function changeMark() {
    let response = await fetch(`http://127.0.0.1:8000/metka/${id}/?title=${document.querySelector('#info_title').value}&x_coor=${x_coor}&y_coor=${y_coor}&description=${document.getElementById("info_description").value}`, {
        method: 'PUT',
        body: formData
    })

    response = await response.json()
    console.log(response)

}

saveChange.addEventListener('click', () => {
    console.log('ПРИВЕТ')
    changeMark()
})

photoMark.addEventListener('change', myFunc)