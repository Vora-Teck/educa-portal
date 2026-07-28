window.Apex = {
  dataLabels: {
    enabled: false
  }
};

async function getData() {

  showLoader("Loading Data...")

  let params = {page: "dashboard"}

  try {
    let data = await cache.fetchOrCache({
      func: "admin.school.schoolData",
      params, fetcher: admin.school.schoolData
    })

    //console.log(data)

    let d = data.data;
              if(data.status == 'success') {
                  //$(".bal-item").html(`&#8358;${shortify(d.balance, true)}`)
                  //$(".bal-item2").html(`&#8358;${digify(d.balance, true)}`)
                  $(".std-item").html(`${digify(d.students.total)}`)
                  $(".tea-item").html(`${digify(d.staff)}`)
                  $(".fee-item").html(`&#8358;${shortify(d.fees.total, true)}`)
                  $(".fee-item2").html(`&#8358;${shortify(d.fees.this_term, true)}`)

                  drawDistroChart(d.students)
                  drawFeeChart(d.fees)
              }
              else {
                      pushNotification("n_error", data.message, 3000)
              }
              hideLoader()
  }
  catch(error) {
    console.error(error);
    hideLoader()
    pushNotification("n_network", "Error occurred. Kindly check your internet connection", 3000)
  }

}

getData()

async function getEvents() {
  let page = 1;
  let pagesize = 3;
  let search = '';
  let status = 'Upcoming';

  $('.event-list').empty()
  loader = `<li>
      <i class="fa fa-spinner rotate"></i>&nbsp;&nbsp;&nbsp;Loading...
      </li>
  </tr>`;
  $('.event-list').append(loader)

  let params = {page, pagesize, status, search}

  try {
    let data = await cache.fetchOrCache({
      func: "admin.calendar.eventList",
      params, fetcher: admin.calendar.eventList
    })

    $('.event-list').empty()
      if(data.status == 'success') {
        if(data.data) {
          let e = data.data;
          for(var i in e) {
            let temp = `
              <li>
                <div class="w-flex w-flex-between w-align-center mb-3">
                  <div class="w-bold-x h5">
                    <i class="fa fa-circle w-text-blue"></i>
                    &nbsp;&nbsp;${e[i].title}
                  </div>
                  <div class="w-text-gray">${datify(e[i].date)}</div>
                </div>
                <p>${e[i].description || e[i].venue}</p>
              </li>`;
            $('.event-list').append(temp)
          }
        }
        else {
          let temp = `
            <li class="w-text-gray w-italic">
              ${data.message}
            </li>`;
          $('.event-list').append(temp)
        }
      }
      else {
        pushNotification("n_error", data.message, 3000);
        let temp = `
          <li class="w-text-gray w-italic">
            ${data['message']}
          </li>`;
        $('.event-list').append(temp)
      }
  }
  catch(error) {
    console.error(error);
    $('.event-list').empty()
    pushNotification("n_network", "Error occurred. Kindly check your internet connection", 3000)
  }
  
  
}
getEvents()

// For Admin
function drawDistroChart(d) {
  try {
    let prices = d.students
    let titles = d.classes
    var optionsBar = {
      chart: {
        type: 'bar',
        height: 250,
        width: '100%',
        stacked: true,
        foreColor: '#999',
      },
      plotOptions: {
        bar: {
          dataLabels: {
            enabled: false
          },
          columnWidth: '50%',
          endingShape: 'rounded'
        }
      },
      colors: ["#4f4ff5"],
      series: [{
        name: "No of Students",
        data: prices,
      }],
      labels: titles,
      xaxis: {
        axisBorder: {
          show: true
        },
        axisTicks: {
          show: false
        },
        crosshairs: {
          show: false
        },
        labels: {
          show: true,
          style: {
            fontSize: '12px'
          }
        },
      },
      grid: {
        xaxis: {
          lines: {
            show: true
          },
        },
        yaxis: {
          lines: {
            show: true
          },
        }
      },
      yaxis: {
        axisBorder: {
          show: false
        },
        labels: {
          show: true
        },
      },
      legend: {
        floating: true,
        position: 'top',
        horizontalAlign: 'right',
        offsetY: -36
      },
      title: {
        text: '',
        align: 'left',
      },
      subtitle: {
        text: ''
      },
      tooltip: {
        shared: true,
        intersect: false
      }
    
    }
    var chartBar = new ApexCharts(document.querySelector('#bar1'), optionsBar);
    chartBar.render();
  }
  catch(err) {
    document.querySelector('#bar1').innerHTML = `<h5 class="w-text-grey">Error occurred.</h5>`
  }

}

function drawTrendChart(d) {
  try {
    var optionsBar = {
      chart: {
        type: 'bar',
        height: 250,
        width: '100%',
        stacked: true,
        foreColor: '#999',
      },
      plotOptions: {
        bar: {
          dataLabels: {
            enabled: false
          },
          columnWidth: '60%',
          endingShape: 'rounded'
        }
      },
      colors: ["#4f4ff5", '#EEE'],
      series: [{
        name: "Present",
        data: [20, 16, 24, 28, 26],
      }, {
        name: "Absent",
        data: [5, 14, 16, 22, 29],
      }],
      labels: ["Mon", "Tue", "Wed", "Thur", "Fri"],
      xaxis: {
        axisBorder: {
          show: true
        },
        axisTicks: {
          show: false
        },
        crosshairs: {
          show: false
        },
        labels: {
          show: true,
          style: {
            fontSize: '12px'
          }
        },
      },
      grid: {
        xaxis: {
          lines: {
            show: true
          },
        },
        yaxis: {
          lines: {
            show: true
          },
        }
      },
      yaxis: {
        axisBorder: {
          show: false
        },
        labels: {
          show: true
        },
      },
      legend: {
        floating: true,
        position: 'top',
        horizontalAlign: 'left',
        offsetY: 5
      },
      title: {
        text: '',
        align: 'left',
      },
      subtitle: {
        text: ''
      },
      tooltip: {
        shared: true,
        intersect: false
      }
    
    }
    var chartBar = new ApexCharts(document.querySelector('#bar'), optionsBar);
    chartBar.render();
  }
  catch(err) {
    document.querySelector('#bar').innerHTML = `<h5 class="w-text-grey">Error occurred.</h5>`
  }
  
  
}

function drawFeeChart(d) {
  let series = [d.paid, d.unpaid]
  try {
    var optionsDonutTop = {
      chart: {
        height: 265,
        type: 'donut',
        offsetY: 20
      },
      plotOptions: {
        pie: {
          customScale: 0.86,
          donut: {
            size: '0%',
          },
          dataLabels: {
            enabled: true
          }
        }
      },
      colors: ['#775DD0', '#E91E63'],
      title: {
        text: ''
      },
      series: series,
      labels: ['Paid', 'Unpaid'],
      legend: {
        show: true
      }
    }
    
    var chartDonut2 = new ApexCharts(document.querySelector('#donutTop'), optionsDonutTop);
    chartDonut2.render()
  }
  catch(err) {
    document.querySelector('#donutTop').innerHTML = `<h5 class="w-text-grey">Error occurred.</h5>`
  }
}

drawTrendChart()


$(function () {
  function c() {
  p();
  var e = h();
  var r = 0;
  var u = false;
  l.empty();
  while (!u) {
  if (s[r] == e[0].weekday) {
  u = true;
  } else {
  l.append('<div class="blank"></div>');
  r++;
  }
  }
  for (var c = 0; c < 42 - r; c++) {
  if (c >= e.length) {
  l.append('<div class="blank"></div>');
  } else {
  var v = e[c].day;
  var m = g(new Date(t, n - 1, v)) ? '<div class="today">' : "<div>";
  l.append(m + "" + v + "</div>");
  }
  }
  var y = o[n - 1];
  a.css("background-color", y)
  .find("h1")
  .text(i[n - 1] + " " + t);
  f.find("div").css("color", y);
  l.find(".today").css("background-color", y);
  d();
  }
  function h() {
  var e = [];
  for (var r = 1; r < v(t, n) + 1; r++) {
  e.push({ day: r, weekday: s[m(t, n, r)] });
  }
  return e;
  }
  function p() {
  f.empty();
  for (var e = 0; e < 7; e++) {
  f.append("<div>" + s[e].substring(0, 3) + "</div>");
  }
  }
  function d() {
  var t;
  var n = $("#dash_calendar").css("width", e + "px");
  n.find((t = "#calendar_weekdays, #calendar_content"))
  .css("width", e + "px")
  .find("div")
  .css({
  width: e / 7 + "px",
  height: e / 7 + "px",
  "line-height": e / 7 + "px",
  });
  n.find("#calendar_header")
  .css({ height: e * (1 / 7) + "px" })
  .find('i[class^="fa"]')
  .css("line-height", e * (1 / 7) + "px");
  }
  function v(e, t) {
  return new Date(e, t, 0).getDate();
  }
  function m(e, t, n) {
  return new Date(e, t - 1, n).getDay();
  }
  function g(e) {
  return y(new Date()) == y(e);
  }
  function y(e) {
  return e.getFullYear() + "/" + (e.getMonth() + 1) + "/" + e.getDate();
  }
  function b() {
  var e = new Date();
  t = e.getFullYear();
  n = e.getMonth() + 1;
  }
  var e = $("#cal-con").width();
  var t = 2013;
  var n = 9;
  var r = [];
  var i = [
  "JANUARY",
  "FEBRUARY",
  "MARCH",
  "APRIL",
  "MAY",
  "JUNE",
  "JULY",
  "AUGUST",
  "SEPTEMBER",
  "OCTOBER",
  "NOVEMBER",
  "DECEMBER",
  ];
  var s = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  ];
  var o = [
  "#16a085",
  "#1abc9c",
  "#c0392b",
  "#27ae60",
  "#FF6860",
  "#f39c12",
  "#f1c40f",
  "#e67e22",
  "#2ecc71",
  "#e74c3c",
  "#d35400",
  "#2c3e50",
  ];
  var u = $("#dash_calendar");
  var a = u.find("#calendar_header");
  var f = u.find("#calendar_weekdays");
  var l = u.find("#calendar_content");
  b();
  c();
  a.find('i[class^="fa"]').on("click", function () {
  var e = $(this);
  var r = function (e) {
  n = e == "next" ? n + 1 : n - 1;
  if (n < 1) {
  n = 12;
  t--;
  } else if (n > 12) {
  n = 1;
  t++;
  }
  c();
  };
  if (e.attr("class").indexOf("left") != -1) {
  r("previous");
  } else {
  r("next");
  }
  });
});
  
