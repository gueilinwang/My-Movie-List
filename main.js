;(function() {
  const BASE_URL = 'https://movie-list.alphacamp.io'
  const INDEX_URL = BASE_URL + '/api/v1/movies/'
  const POSTER_URL = BASE_URL + '/posters/'
  const data = []
  const dataPanel = document.querySelector('#data-panel')
  const searchForm = document.getElementById('search')
  const searchInput = document.getElementById('search-input')
  let searchData = [] //紀錄search篩選出的內容
  const modalTitle = document.getElementById('show-movie-title')
  const modalImage = document.getElementById('show-movie-image')
  const modalDate = document.getElementById('show-movie-date')
  const modalDescription = document.getElementById('show-movie-description')
  const modalFooter = document.querySelector('.modal-footer')
  const favoriteList = JSON.parse(localStorage.getItem('favoriteMovies')) || []
  const pagination = document.getElementById('pagination')
  const itemPerPage = 12 //每頁所要呈現的內容數
  let nowPage = 1 //紀錄當前的頁數,預設是第一頁
  const displayMode = document.querySelector('#display-mode')
  let modeFlag = 'card' //預設是card-mode

  // let paginationData = []

  //將取得的data以card或List方式呈現到畫面上
  function displayDataList(data, modeFlag) {
    let htmlContent = ''
    if (modeFlag === 'card') {
      data.forEach(item => {
        htmlContent += `
      <div class="col-sm-3">
        <div class="card mb-2">
          <a href="${POSTER_URL}${item.image}" target="_blank">
            <img class="card-img-top scale" src="${POSTER_URL}${item.image}" data-id="${item.id}" alt="Card image cap" >
          </a>
          <div class="card-body movie-item-body">
            <h6 class="card-title">${item.title}</h6>
          </div>
          <!-- "More" button -->
          <div class="card-footer">
            <button class="btn btn-primary btn-show-movie" data-toggle="modal" data-target="#show-movie-modal" data-id="${item.id}">More</button>
            <button class="btn btn-light btn-add-favorite" data-id="${item.id}"><i class="fas fa-heart" data-id="${item.id}"></i></button>
          </div>
        </div>
      </div>    
      `
      })
    } else if (modeFlag === 'list') {
      data.forEach(item => {
        htmlContent += `
          <div class = "col-12">
            <div class = "row no-gutters justify-content-between">
              <div class = "col-sm-9 border-style mb-3">
                <a href="${POSTER_URL}${item.image}" target="_blank">
                  <h6>${item.title}</h6>
                </a>  
              </div>
              <div class = "col-sm-3 border-style mb-3">
                
                  <button class="btn btn-primary btn-show-movie  mr-2" data-toggle="modal" data-target="#show-movie-modal" data-id="${item.id}">More</button>
                  <button class="btn btn-light btn-add-favorite" data-id="${item.id}"><i class="fas fa-heart" data-id="${item.id}"></i></button>
                </div>
              </div>
            </div>
          </div>`
      })
    }

    dataPanel.innerHTML = htmlContent
    checkFavoriteMovie()
  }
  //取得Movie的詳細資料並呈現在modal上
  function showMovie(id) {
    const url = INDEX_URL + id

    axios
      .get(url)
      .then(res => {
        const data = res.data.results
        modalTitle.textContent = data.title
        modalImage.innerHTML = `<img src="${POSTER_URL}${data.image}"class="img-fluid" alt="Responsive image">`
        modalDate.textContent = `release at : ${data.release_date}`
        modalDescription.textContent = `${data.description}`
        modalFooter.firstElementChild.dataset.id = `${data.id}`
        modalFooter.firstElementChild.firstElementChild.dataset.id = `${data.id}`
        checkFavoriteMovie()
      })
      .catch(err => console.log(err))
  }

  //透過data的id將該筆data將入到favorite中
  function addFavoriteItem(id) {
    const movie = data.find(item => item.id === Number(id))
    const index = favoriteList.findIndex(item => item.id === Number(id))
    let heart = document.querySelectorAll(`i[data-id="${id}"]`)
    if (index !== -1) {
      if (confirm(`Removed "${movie.title}" from your favorite list!`)) {
        favoriteList.splice(index, 1)
        heart.forEach(item => item.classList.remove('fa-heart-active'))
      }
    } else {
      favoriteList.push(movie)

      heart.forEach(item => item.classList.add('fa-heart-active'))
      alert(`Added "${movie.title}" to your favorite list!`)
    }
    // changeHeartIcon(id)
    localStorage.setItem('favoriteMovies', JSON.stringify(favoriteList))
  }

  //確認是不是有之前favorite movie的紀錄,如果有要將圖示改成紅色愛心
  function checkFavoriteMovie() {
    if (favoriteList.length) {
      favoriteList.forEach(item => {
        document
          .querySelectorAll(`i[data-id="${item.id}"]`)
          .forEach(item => item.classList.add('fa-heart-active'))
      })
    }
  }

  //計算總頁數
  function getTotalPages(data) {
    let totalPages = Math.ceil(data.length / itemPerPage) || 1
    let pageItemContent = ''
    for (let i = 0; i < totalPages; i++) {
      pageItemContent += `<li class="page-item">
            <a class="page-link" href="#" data-page="${i + 1}">${i + 1}</a>
          </li>`
    }
    pagination.innerHTML = pageItemContent
    if (totalPages < nowPage) {
      nowPage = totalPages
    }
  }
  //取得當頁的內容
  function getPageData(pageNum, data) {
    // paginationData = data || paginationData
    let offset = (pageNum - 1) * itemPerPage
    let pageData = data.slice(offset, offset + itemPerPage)
    displayDataList(pageData, modeFlag)
  }

  //先透過axios取的所需要的data
  axios
    .get(INDEX_URL)
    .then(res => {
      data.push(...res.data.results)

      getTotalPages(data)
      getPageData(nowPage, data)
    })
    .catch(err => console.log(err))
  // 設置More按鈕監聽器跟favorite監聽器
  dataPanel.addEventListener('click', event => {
    let key = event.target
    if (key.matches('.btn-show-movie')) {
      showMovie(key.dataset.id)
    } else if (key.matches('.fas') || key.matches('.btn-add-favorite')) {
      addFavoriteItem(key.dataset.id)
    }
  })
  //設置Search-bar監聽器
  searchForm.addEventListener('submit', event => {
    event.preventDefault()
    let results = []
    const regex = new RegExp(searchInput.value, 'i')
    results = data.filter(movie => movie.title.match(regex))

    if (!searchInput.value.trim()) {
      alert(`請記得輸入電影名稱!!`)
      getTotalPages(data)
      getPageData(nowPage, data)
      searchData = []
    } else {
      if (!results.length) {
        alert('找不到你要的電影,請確認名稱是否輸入正確!!')
        getTotalPages(data)
        getPageData(nowPage, data)
        searchData = []
      } else {
        searchData = results
        getTotalPages(results)
        getPageData(nowPage, results)
      }
    }

    searchInput.value = ''
  })

  //在modal上也設置favorite監聽器
  modalFooter.addEventListener('click', event => {
    let key = event.target
    if (key.matches('.fas') || key.matches('.btn-add-favorite')) {
      addFavoriteItem(key.dataset.id)
    }
  })
  // 設置pagination的監聽器
  pagination.addEventListener('click', event => {
    if (event.target.tagName === 'A') {
      nowPage = event.target.dataset.page
      if (searchData.length) {
        getPageData(nowPage, searchData)
      } else {
        getPageData(nowPage, data)
      }
    }
  })
  //在切換呈現模式上設置監聽器
  displayMode.addEventListener('click', event => {
    if (event.target.matches('#card-mode')) {
      modeFlag = 'card'
      getTotalPages(data)
      getPageData(nowPage, data)
    } else if (event.target.matches('#list-mode')) {
      modeFlag = 'list'
      getTotalPages(data)
      getPageData(nowPage, data)
    }
  })
})()
