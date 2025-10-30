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


function datify(date, time=false) {
  if(time) {
    return `${new Date(date).toDateString()} ${new Date(date).toLocaleTimeString()}`
  }
  else {
    return `${new Date(date).toDateString()}`;
  }
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
        if(data.authenticated == false && location.pathname == "/") {
          localStorage.removeItem("educa_school_info");
          localStorage.removeItem("educa_user_info");
          location.href = '/login/'
        }
        else if(data.authenticated == true && location.pathname == "/login/") {
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

document.addEventListener('online', checkStatus)
document.addEventListener('offline', checkStatus)

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
