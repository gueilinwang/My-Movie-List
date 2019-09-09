;(function() {
  const BASE_URL = 'https://movie-list.alphacamp.io'
  const INDEX_URL = BASE_URL + '/api/v1/movies/'
  const POSTER_URL = BASE_URL + '/posters/'
  const data = JSON.parse(localStorage.getItem('favoriteMovies')) || []
  const dataPanel = document.querySelector('#data-panel')

  const modalTitle = document.getElementById('show-movie-title')
  const modalImage = document.getElementById('show-movie-image')
  const modalDate = document.getElementById('show-movie-date')
  const modalDescription = document.getElementById('show-movie-description')
  const modalFooter = document.querySelector('.modal-footer')
  const pagination = document.getElementById('pagination')
  const itemPerPage = 12
  let nowPage = 1
  //將取得的data以card方式呈現到畫面上
  function displayDataList(data) {
    let htmlContent = ''
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
            <button class="btn btn-light btn-add-favorite" data-id="${item.id}"><i class="fas fa-heart fa-heart-active" data-id="${item.id}"></i></button>
          </div>
        </div>
      </div>    
      `
    })
    dataPanel.innerHTML = htmlContent
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
    displayDataList(pageData)
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
      })
      .catch(err => console.log(err))
  }
  //將該筆data移除
  function removeFavoriteMovie(id) {
    const movie = data.find(item => item.id === Number(id))
    const index = data.findIndex(item => item.id === Number(id))

    if (confirm(`Removed "${movie.title}" from your favorite list!`)) {
      data.splice(index, 1)
      localStorage.setItem('favoriteMovies', JSON.stringify(data))
    }
  }

  // 設置More按鈕監聽器跟favorite監聽器
  dataPanel.addEventListener('click', event => {
    let key = event.target
    if (key.matches('.btn-show-movie')) {
      showMovie(key.dataset.id)
    } else if (key.matches('.fas') || key.matches('.btn-add-favorite')) {
      removeFavoriteMovie(key.dataset.id)
      getTotalPages(data)
      getPageData(nowPage, data)
    }
  })

  //在modal上也設置favorite監聽器
  modalFooter.addEventListener('click', event => {
    let key = event.target
    if (key.matches('.fas') || key.matches('.btn-add-favorite')) {
      removeFavoriteMovie(key.dataset.id)
    }
    getTotalPages(data)
    getPageData(nowPage, data)
  })
  // 設置pagination的監聽器
  pagination.addEventListener('click', event => {
    if (event.target.tagName === 'A') {
      nowPage = event.target.dataset.page
      getPageData(event.target.dataset.page, data)
    }
  })
  getTotalPages(data)
  getPageData(nowPage, data)
})()
