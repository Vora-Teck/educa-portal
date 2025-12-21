//const base_image_url = `https://kosmoshr.pythonanywhere.com`;

const admin = new educaSDK.Admin()
const base_url = educaSDK.BASE_URL


/* Navigation bar */
/* Set the width of the side navigation to 250px and the left margin of the page content to 250px */
//localStorage.removeItem('api_key')
function openNav() {
    $(".sidenav").toggleClass('active');
    $("main").toggleClass('active');
  }


function showDP() {
  if(localStorage.dp) {
    //console.log(localStorage.dp)
    $('.admin-img').attr('src', `${base_image_url}${localStorage.dp}`)
  }
}
//showDP();

function digify(n, decimal=false) {
  let a = Number(n)
  if(decimal) {
    return a.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})
  }
  else{
    return a.toLocaleString()
  }
  
}

function truncateWord(str, n) {
  trunc_str = str.substring(0, n);
  if(str.length > n) {
    trunc_str += "...";
  }
  return trunc_str
}

function shortify(n, decimal=false) {
  let a = Number(n);
  if(a >= 1000000) {
    return `${(a/1000000).toFixed(3)}M`
  }
  else if(a >= 1000) {
    return `${(a/1000).toFixed(2)}K`
  }
  else {
    return digify(n, decimal)
  }
}


function datify(date=null, time=false) {
  if(!date) {date = new Date()}
  let is_date = date instanceof Date

  let date_obj = is_date ? date : new Date(date)
  if(time) {
    return `${date_obj.toDateString()} ${date_obj.toLocaleTimeString()}`
  }
  else {
    return `${date_obj.toDateString()}`;
  }
}

function monthify(date) {
  let months = ['January', 'February', 'March', 'April', 'May', 'June', 'July',
    'August', 'September', 'October', 'November', 'December'
  ]
  
  let dt = new Date(date);
  return `${months[dt.getMonth()]} ${dt.getFullYear()}`
}

function dateDiff(date) {
  let givenDate = new Date(date);
  let today = new Date();

  let diff_years = today.getFullYear() - givenDate.getFullYear();

  if(
    today.getMonth() < givenDate.getMonth() ||
    (today.getMonth() === givenDate.getMonth() && today.getDate() < givenDate.getDate())
  ) {
    diff_years--;
  }
  return diff_years;
}

function pushNotification(type, text, time, event=null) {
  var t = {
    n_error: "/static/logos/error.png",
    n_info: "/static/logos/info.png",
    n_network: "/static/logos/network.png",
    n_success: "/static/logos/success.png",
    n_warning: "/static/logos/warning.png",
  }
  Toastify({
    text: text,
    duration: time, // -1 for permanent
    className: `${type} w-card w-bold`,
    //destination: "#",
    newWindow: true,
    close: true,
    avatar: t[type], // image to br shown before text
    gravity: "top", // `top` or `bottom`
    position: "right", // `left`, `center` or `right`
    stopOnFocus: true, // Prevents dismissing of toast on hover
    style: {
      //background: "linear-gradient(to right, #00b09b, #96c93d)",
    },
    offset: {
      x: '0px',
      y: '-10px',
    },
    //callback: function(){}, // when toast is dismissed
    ariaLive: "polite",
    oldestFirst: true,
    escapeMarkup: false, // escape markup syntax
    onClick: event // Callback after click
  }).showToast();
}

function downloadFile(url, filename="") {
  let link = document.createElement('a');
  link.href = url;
  link.target = "_blank";
  link.dowload = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  pushNotification("n_success", "File downloaded successfully", 4000);
}

function getQueryParams() {
  let params = new URLSearchParams(window.location.search);
  let query = Object.fromEntries(params.entries());
  return query
}

function buildQueryParams(obj, hash=null) {
  if(hash == null) hash = window.location.hash;
  let params = new URLSearchParams(obj);
  let url = `${window.location.protocol}//${window.location.host}/?${params.toString()}${hash}`;
  return url
}


function showLoader(text="") {
  $("#loader-text").html(text)
  $(".page-load").addClass("active")
}
function hideLoader() {
  $("#loader-text").empty()
  $(".page-load").removeClass("active")
}

function showOwl(containerClass, dotsClass) {
    $(containerClass).owlCarousel({
      items: 1,
      loop: false,
      autoplay: false,
      nav: false,   // no arrows
      dots: true,   // show dots
      dotsContainer: dotsClass
    });
}

function checkStatus() {
  if(!navigator.onLine && location.hostname != '127.0.0.1') {
    pushNotification("n_network", "You are currently offline!", 3000)
  }
  
  admin.account.loginStatus({
    onSuccess: (data) => {
      if(data.status == 'success') {
        // if(data.authenticated == false && location.pathname == "/") {
          
        //   localStorage.removeItem("educa_school_info");
        //   localStorage.removeItem("educa_user_info");
        //   location.href = '/login/'
        // }
        if(data.authenticated == true && location.pathname == "/login/") {
          location.href = '/'
        }
      }
    },
    onError: (error) => {
      console.error(error)
    }
  })
}
checkStatus()


function checkResponse(data) {
  if(data.statusCode && data.statusText) {
    pushNotification("n_error", `Error ${data.statusCode}: ${data.statusText}`)
  }
  
}

//document.addEventListener('online', checkStatus)
//document.addEventListener('offline', checkStatus)

function showSchoolInfo() {
  let info = localStorage.getItem("educa_school_info");
  if(info) {
      info = JSON.parse(info);
      //console.log(info)
      $(".site-title").html(info.name)
      $("#site-motto").html(info.motto)
      if(info.logo) {
        $("#site-logo").attr('src', info.logo)
      }
  }
  else {
      admin.school.schoolInfo({
          onSuccess: (data) => {
              let d = data.data;
              if(d.logo !== null) {
                  d['logo'] = base_url + d.logo
              }
              let obj = {name: d.name, logo: d.logo, motto: d.motto}
              localStorage.setItem('educa_school_info', JSON.stringify(obj));
              showSchoolInfo()
          },
          onError: (error) => {
              console.error(error)
          }
        })
  }
}

function showUserInfo() {
  let info = localStorage.getItem("educa_user_info");
  if(info) {
      info = JSON.parse(info);
      //console.log(info)
      $(".admin-user").html(info.full_name)
  }
  else {
    admin.account.getProfile({
          onSuccess: (data) => {
              let d = data.data;
              let obj = {full_name: `${d.firstName} ${d.lastName}`}
              localStorage.setItem('educa_user_info', JSON.stringify(obj));
              showUserInfo()
          },
          onError: (error) => {
              console.error(error)
          }
        })
  }
}

function showPlanInfo() {

  admin.subscription.getCurrentPlan({
      onSuccess: (data) => {
              //console.log(data);
              $(".plan-alert2").empty()
              if(data.status == 'success') {
                let d = data.data;
                let temp = ``
                if(d.level == 0) {
                  temp = `
                  <div class="alert alert-info">
                    <i class="fa fa-info-circle"></i>&nbsp;
                    You are currently on a <strong>${d.title} Plan</strong> for <strong>${d.duration}</strong> and 
                    ${d.expired ? `it expired` : `will expire`} on <strong>${datify(d.expiry_date, false)}</strong>. 
                    <a href="#subscription" class="w-text-red">Click Here</a> to upgrade your plan.
                  </div>`
                }
                else {
                  let givenDate = new Date(d.expiry_date);
                  let today = new Date();

                  let diff = givenDate - today
                  let diff_days = diff / (1000 * 60 * 60 * 24);
                  //console.log(diff_days)
                  if(diff_days <= 7) {
                    temp = `
                    <div class="alert alert-info">
                    <i class="fa fa-info-circle"></i>&nbsp;
                    You are currently on a <strong>${d.title} Plan</strong> for <strong>${d.duration}</strong> and 
                    ${d.expired ? `it expired` : `will expire`} on <strong>${datify(d.expiry_date, false)}</strong>. 
                    <a href="#subscription" class="w-text-red">Click Here</a> to extend or upgrade your plan.
                  </div>`;
                  }
                  
                }
                
                $(".plan-alert2").html(temp)
              }
              else {
                //pushNotification("n_error", data.message, 3000)
              }
      },
      onError: (error) => {
              console.error(error);
              //pushNotification("n_network", "Error occurred. Kindly check your internet connection", 3000)
      }
})
}

function initiateTiny(elem='.html-text', content="") {
  tinymce.init({
      selector: elem,
      setup: function(editor) {
          editor.on('init', function(e) {
            editor.setContent(content)
          })
      },
      plugins: 'anchor autolink charmap codesample emoticons image link lists media searchreplace table visualblocks wordcount',
      toolbar: 'undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | link image media table mergetags | addcomment showcomments | tinycomments | spellcheckdialog a11ycheck typography | align lineheight | checklist numlist bullist indent outdent | emoticons charmap | removeformat',
      tinycomments_mode: 'embedded',
      tinycomments_author: 'Admin',
      mergetags_list: [
          {value: 'First.Name', title: 'First Name'},
          {value: 'Email', title: 'Email'},
      ],
      ai_request: (request, respondWith) => respondWith.string(() => Promise.reject("See docs to implement AI Assistant")),
  });
}
//initiateTiny();
