const photoMark = document.querySelector('#photo_mark_input')
const gallery = document.querySelector('#gallery')
let saveChange = document.querySelector('#saveChange')
const formData = new FormData()

function myFunc() {
    const files = photoMark.files
    const reader = []
    
    gallery.innerHTML = ''

    for (let j = 0; j < formData.length; j++){
        formData.delete(`photo[${j}]`)
    }

    for (let i = 0; i < files.length; i++){
        
        const reader = new FileReader()
        
        formData.append(`photo[${i}]`, files[i])

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
                formData.delete(`photo[${i}]`)
            })
            


            container.appendChild(imgElement)
            container.appendChild(deleteBtn)
            gallery.appendChild(container)
        };
        
        reader.readAsDataURL(files[i])
        
        console.log(files[i])
    }

    
    saveChange.onclick = () => {
        changeMark(formData)
    }

}

photoMark.addEventListener('change', myFunc)

async function changeMark(formData) {

    let id = document.querySelector('#info_id').value
    let title = document.querySelector('#info_title').value
    let x_coor = document.querySelector('#info_x_coor').value
    let y_coor = document.querySelector('#info_y_coor').value
    let description = document.querySelector('#info_description').value

    let response = await fetch(`/metka/${id}/?title=${title}&x_coor=${x_coor}&y_coor=${y_coor}&description=${description}`, {
        method: 'PUT',
        headers: {'Content-Type': 'multipart/form-data'},
        body: formData
    })

    response = await response.json()
    console.log(response)
}