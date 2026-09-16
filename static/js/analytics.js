window.Apex = {
  dataLabels: {
    enabled: false
  }
};
// ====================== General Data ======================
async function getData() {

  showLoader("Loading Data...")

  try {
    let data = await cache.fetchOrCache({
      func: "admin.school.schoolData",
      params: {page: "analytic"}, fetcher: admin.school.schoolData
    })

    let d = data.data;
              if(data.status == 'success') {
                  $(".bal-item").html(`&#8358;${shortify(d.balance, true)}`)
                  $(".bal-item2").html(`&#8358;${digify(d.balance, true)}`)
                  $(".std-item").html(`${digify(d.students.total)}`)
                  $(".tea-item").html(`${digify(d.staff)}`)
                  $(".most-pop-item").html(d.most_populated.class || 'N/A')
                  $(".most-pop-text").html(`
                    ${digify(d.most_populated.info.total_students, false)} Students 
                    (${digify(d.most_populated.info.male, false)} Males, ${digify(d.most_populated.info.female, false)} Females)
                  `)
                  $(".top-class-item").html(d.top_class || 'N/A')
                  $(".top-sub-item").html(d.top_subject || 'N/A')
                  $(".top-class-avg").html(`${digify(d.top_class_average, true)}% Average`)
                  $(".top-sub-avg").html(`${digify(d.top_subject_average, true)}% Average`)
                  $(".att-item").html(`${d.attendance_rate}%`)
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

async function getTerms() {
  try {
    let data = await cache.fetchOrCache({
      func: "admin.calendar.termList",
      fetcher: admin.calendar.termList
    })

    let d = data.data
              $(".term-filter").empty();
              for(let i in d) {
                  let temp = `<option value="${d[i].id}">${d[i].title} - ${d[i].session.title}</option>`;
                  $(".term-filter").append(temp)
              }
            getClassrooms();
            getClassPerformance();
            getFeesData();
  }
  catch(error) {
    console.error(error);
  }
}
getTerms()

async function getSessions() {
  try {
    let data = await cache.fetchOrCache({
      func: "admin.calendar.sessionList",
      fetcher: admin.calendar.sessionList
    })

    let d = data.data
              $(".session-filter").empty();
              for(let i in d) {
                  let temp = `<option value="${d[i].id}">${d[i].title}</option>`;
                  $(".session-filter").append(temp)
              }
            staffPerformanceData()
  }
  catch(error) {
    console.error(error);
  }
}
getSessions()

async function getClassrooms() {
  try {
    let data = await cache.fetchOrCache({
      func: "admin.classroom.getClassrooms",
      fetcher: admin.classroom.getClassrooms
    })

    $('.class-filter').empty()
              if(data.status == 'success') {
                  if(data.data) {
                      let e = data.data;
                      for(var i in e) {
                          $('.class-filter').append(`<option value="${e[i].id}">${e[i].title}${e[i].division}</option>`);
                          
                      }
                  }
                getSubjectPerformance()
                getPassFailRate()
                getPerformingSubjects("top")
                getPerformingSubjects("low")
                getFeesBreakdown()
              }
  }
  catch(error) {
    console.error(error);
    pushNotification("n_network", "Error occurred. Kindly check your internet connection", 3000)
  }
}

// ====================== Academic Report ========================
async function getSubjectPerformance() {
  let class_id = $("#sub-per-class").val();
  let term_id = $("#sub-per-term").val()

  try {
    let data = await cache.fetchOrCache({
      func: "admin.analytic.getSubjectPerformance",
      params: {class_id, term_id}, fetcher: admin.analytic.getSubjectPerformance
    })

    if(data.status == 'success') {
                $("#bar1").empty()
                  subPerformanceChart(data.data)
              }
              else {
                pushNotification("n_network", data.message, 3000)
              }
  }
  catch(error) {
    console.error(error);
    pushNotification("n_network", "Error occurred. Kindly check your internet connection", 3000)
  }

}

async function getClassPerformance() {
  let term_id = $("#class-per-term").val()

  try {
    let data = await cache.fetchOrCache({
      func: "admin.analytic.getClassPerformance",
      params: {term_id}, fetcher: admin.analytic.getClassPerformance
    })

    if(data.status == 'success') {
                $("#bar").empty()
                  classPerformanceChart(data.data)
              }
              else {
                pushNotification("n_network", data.message, 3000)
              }
  }
  catch(error) {
    console.error(error);
    pushNotification("n_network", "Error occurred. Kindly check your internet connection", 3000)
  }
}

async function getPassFailRate() {
  let class_id = $("#pass-fail-class").val();
  let term_id = $("#pass-fail-term").val();

  try {
    let data = await cache.fetchOrCache({
      func: "admin.analytic.getPassFailRate",
      params: {class_id, term_id}, fetcher: admin.analytic.getPassFailRate
    })

    if(data.status == 'success') {
                $("#donutTop").empty()
                  passFailChart(data.data)
              }
              else {
                pushNotification("n_network", data.message, 3000)
              }
  }
  catch(error) {
    console.error(error);
    pushNotification("n_network", "Error occurred. Kindly check your internet connection", 3000)
  }
}

async function getPerformingSubjects(typ) {
  let class_id = $(`#${typ}-sub-class`).val();
  let term_id = $(`#${typ}-sub-term`).val()

  $(`.${typ}-sub-list`).empty()

  try {
    let data = await cache.fetchOrCache({
      func: "admin.analytic.getPerformingSubjects",
      params: {class_id, term_id, type:typ}, fetcher: admin.analytic.getPerformingSubjects
    })

    if(data.status == 'success') {
            let d = data.data;
            if(d.length > 0) {
              for(let i in d) {
                let temp = `
                <li>
                  <div class="sub-icon-con">
                    <div class="fa fa-graduation-cap sub-icon"></div>
                    <div class="h5 w-bold">${d[i].subject}</div>
                  </div>
                  <div class="h5 w-bold">${d[i].average}%</div>
                </li>`;
                $(`.${typ}-sub-list`).append(temp)
              }
            }
            else {
              let temp = `
              <li>No subjects found.</li>`;
              $(`.${typ}-sub-list`).append(temp)
            }
        }
        else {
          pushNotification("n_network", data.message, 3000)
        }
  }
  catch(error) {
    console.error(error);
    pushNotification("n_network", "Error occurred. Kindly check your internet connection", 3000)
  }

}

// =================== Financial Report =========================
async function getFeesData() {
  let term_id = $(`#fee-coll-term`).val()

  $('.out-list').empty()
    loader = `<tr>
        <td colspan="6" class="">
        <i class="fa fa-spinner rotate"></i>&nbsp;&nbsp;&nbsp;Processing...
        </td>
    </tr>`;
    $('.out-list').append(loader)
  
  try {
    let data = await cache.fetchOrCache({
      func: "admin.analytic.getFeesData",
      params: {term_id}, fetcher: admin.analytic.getFeesData
    })

    if(data.status == 'success') {
            let d = data.data;
            let e = d.outstanding;
            let a = d.trend;
            $("#donutTop2").empty()
            $("#area-adwords").empty()
            $('.out-list').empty()
            $("#tot-fees").html(digify(d.fees.total));
            $("#coll-fees").html(digify(d.fees.paid));
            $("#out-fees").html(digify(d.fees.unpaid));
            $("#fees-rate").html(digify(d.fees.paid_rate));
            for(let i in e) {
              let temp = `
              <tr>
                <td>${e[i].student.firstName} ${e[i].student.middleName} ${e[i].student.lastName}</td>
                <td>${e[i].student.classroom.title}${e[i].student.classroom.division}</td>
                <td style="text-align:center;">&#8358;${digify(e[i].outstanding)}</td>
              </tr>`;
              $('.out-list').append(temp)
            }
            feesChart(d.fees)
            feeTrendChart(a)
        }
        else {
          $('.out-list').empty()
          pushNotification("n_error", data.message, 3000)
        }
  }
  catch(error) {
    console.error(error);
    pushNotification("n_network", "Error occurred. Kindly check your internet connection", 3000)
  }
}

async function getFeesBreakdown() {
  let term_id = $(`#fees-break-term`).val();
  let class_id = $("#fees-break-class").val();

  $('#donutTop3').empty()
    let loader = `<p>
        <i class="fa fa-spinner rotate"></i>&nbsp;&nbsp;&nbsp;Processing...
    </p>`;
    $('#donutTop3').append(loader)

  try {
    let data = await cache.fetchOrCache({
      func: "admin.analytic.getFeesBreakdown",
      params: {term_id, class_id}, fetcher: admin.analytic.getFeesBreakdown
    })

    $('#donutTop3').empty()
        if(data.status == 'success') {
          let d = data.data;
          if(d) {
            feesBreakdownChart(d)
          }
          else {
            let temp = `
            <p class="w-text-gray mt-3">
              No tuition was created for selected term and classroom
            </p>`;
          $('#donutTop3').append(temp)
          }
        }
        else {
          pushNotification("n_error", data.message, 3000)
        }
  }
  catch(error) {
    console.error(error);
    $('#donutTop3').empty()
    pushNotification("n_network", "Error occurred. Kindly check your internet connection", 3000)
  }
}

var months = {1: "January", 2: "February", 3: "March", 4: "April", 5: "May", 6: "June", 7: "July", 8: "August", 9: "September", 10: "October", 11: "November", 12: "December"}
function setYearMonth() {
    let today = new Date();
    let curr_year = today.getFullYear();
    let curr_month = today.getMonth() + 1;

    // clear year option
    $("#year-filter").empty()
    $("#month-filter").empty()

    for(let i = 2026; i <= curr_year; i++) {
        var temp = `<option value="${i}">${i}</option>`;
        $("#year-filter").prepend(temp)
    }
    for(let i in months) {
        var temp = `<option value="${i}">${months[i]}</option>`;
        $("#month-filter").append(temp)
    }
    $("#year-filter").val((curr_year).toString())
    $("#month-filter").val((curr_month).toString())
    getPayrollData()
}
setYearMonth()


async function getPayrollData() {
  let month = $("#month-filter").val();
  let year = $("#year-filter").val();

  try {
    let data = await cache.fetchOrCache({
      func: "admin.analytic.getPayrollData",
      params: {month, year}, fetcher: admin.analytic.getPayrollData
    })

    if(data.status == 'success') {
            let d = data.data;
            $("#pay-staff").html(digify(d.total_staff));
            $("#pay-cost").html(digify(d.payroll_cost));
            $("#pay-paid").html(digify(d.payroll_paid));
            $("#pay-pend").html(digify(d.payroll_pending));
        }
        else {
          pushNotification("n_error", data.message, 3000)
        }
  }
  catch(error) {
    console.error(error);
    pushNotification("n_network", "Error occurred. Kindly check your internet connection", 3000)
  }

}

// =================== Staff Report =========================
async function staffPerformanceData() {
  let term = $(`#level-term`).val();
  let session_id = $(`#level-session`).val();
  let class_level = $("#level-cat").val();

  $('.workload-list').empty()
  $('.perform-list').empty()
    loader = `<tr>
        <td colspan="4" class="">
        <i class="fa fa-spinner rotate"></i>&nbsp;&nbsp;&nbsp;Processing...
        </td>
    </tr>`;
    $('.workload-list').append(loader)
    $('.perform-list').append(loader)

  try {
    let data = await cache.fetchOrCache({
      func: "admin.analytic.staffPerformanceData",
      params: {term, class_level, session_id}, fetcher: admin.analytic.staffPerformanceData
    })

    $('.workload-list').empty()
        $('.perform-list').empty()
        if(data.status == 'success') {
            let d = data.data;
            let e = d.workload;
            let a = d.performance;
            if(e.length > 0) {
              for(let i in e) {
                let temp = `
                <tr>
                  <td>${e[i].staff_name}</td>
                  <td>${e[i].subjects.join(', ')}</td>
                  <td>${e[i].classes.join(', ')}</td>
                  <!--
                  <td>
                    <ul style="padding-left:20px;">
                    ${e[i].subjects.map(x => `<li>${x}</li>`)}
                    </ul>
                  </td>
                  <td>
                    <ul style="padding-left:20px;">
                    ${e[i].classes.map(x => `<li>${x}</li>`)}
                    </ul>
                  </td>
                  -->
                  <td>0</td>
                </tr>`;
                $('.workload-list').append(temp)
              }
            }
            else {
              let temp = `
                <tr>
                  <td colspan="4">
                    <p class="w-text-gray"><i>No data found.</i></p>
                  </td>
                </tr>`;
                $('.workload-list').append(temp)
            }
            if(a.length > 0) {
              for(let i in a) {
                let temp = `
                <tr>
                  <td>${a[i].staff_name}</td>
                  <td>${a[i].subjects}</td>
                  <td>${a[i].average}%</td>
                  <td>${a[i].pass_rate}%</td>
                  <td>${a[i].rating}</td>
                </tr>`;
                $('.perform-list').append(temp)
              }
            }
            else {
              let temp = `
                <tr>
                  <td colspan="5">
                    <p class="w-text-gray"><i>No data found.</i></p>
                  </td>
                </tr>`;
                $('.perform-list').append(temp)
            }
        }
        else {
          let temp = `
                <tr>
                  <td colspan="4">
                    <p class="w-text-gray"><i>${data.message}</i></p>
                  </td>
                </tr>`;
          $('.workload-list').append(temp)
          $('.perform-list').append(temp)
        }
  }
  catch(error) {
    console.error(error);
    pushNotification("n_network", "Error occurred. Kindly check your internet connection", 3000)
  }
}



// ==================== Charts ============================
function subPerformanceChart(d) {
  try {
    let prices = d.scores
    let titles = d.subjects
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
        name: "Average Scores",
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

function classPerformanceChart(d) {
  try {
    let prices = d.scores
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
        name: "Average Scores",
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
    var chartBar = new ApexCharts(document.querySelector('#bar'), optionsBar);
    chartBar.render();
  }
  catch(err) {
    document.querySelector('#bar').innerHTML = `<h5 class="w-text-grey">Error occurred.</h5>`
  }

}

function feesChart(d) {
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
            size: '40%',
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
      labels: [`Paid`, `Unpaid`],
      legend: {
        show: true
      }
    }
    
    var chartDonut2 = new ApexCharts(document.querySelector('#donutTop2'), optionsDonutTop);
    chartDonut2.render()
  }
  catch(err) {
    document.querySelector('#donutTop2').innerHTML = `<h5 class="w-text-grey">Error occurred.</h5>`
  }
}

function feesBreakdownChart(d) {
  let f = d.details;
  //console.log(d)
  let seriess = Object.values(f)
  let serie = seriess.map(x => parseInt(x, 10))
  try {
    var optionsDonutTop2 = {
      chart: {
        height: 265,
        type: 'donut',
        offsetY: 20
      },
      plotOptions: {
        pie: {
          customScale: 0.86,
          donut: {
            size: '40%',
          },
          dataLabels: {
            enabled: true
          }
        }
      },
      colors: generateColors(serie.length),
      title: {
        text: `Fees Breakdown - ₦${digify(d.amount)}`
      },
      series: serie,
      labels: Object.keys(f),
      legend: {
        show: true
      }
    }
    
    var chartDonut3 = new ApexCharts(document.querySelector('#donutTop3'), optionsDonutTop2);
    chartDonut3.render()
  }
  catch(err) {
    document.querySelector('#donutTop3').innerHTML = `<h5 class="w-text-grey">Error occurred.</h5>`
  }
}

function passFailChart(d) {
  let series = [d.passed, d.failed]
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
      labels: ['% Passed', '% Failed'],
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

function feeTrendChart(d) {
  try {
    var optionsArea = {
      chart: {
        height: 421,
        type: 'area',
        background: '#fff',
        stacked: true,
        offsetY: 39,
        zoom: {
          enabled: false
        }
      },
      plotOptions: {
        line: {
          dataLabels: {
            enabled: true
          }
        }
      },
      stroke: {
        curve: 'straight'
      },
      colors: ["#3F51B5"],
      series: [{
          name: "Fees Collected",
          data: Object.values(d)
        }
      ],
      fill: {
        type: 'gradient',
        gradient: {
          inverseColors: false,
          shade: 'light',
          type: "vertical",
          opacityFrom: 0.9,
          opacityTo: 0.0,
          stops: [0, 100, 100, 100]
        }
      },
      title: {
        text: 'Payment Trend',
        align: 'left',
        offsetY: -5,
        offsetX: 20
      },
      subtitle: {
        text: 'Monthly Revenue',
        offsetY: 30,
        offsetX: 20
      },
      markers: {
        size: 0,
        style: 'hollow',
        strokeWidth: 8,
        strokeColor: "#fff",
        strokeOpacity: 0.25,
      },
      grid: {
        show: true,
        padding: {
          left: 0,
          right: 0
        }
      },
      yaxis: {
        show: true
      },
      labels: Object.keys(d),
      xaxis: {
        type: 'month',
        tooltip: {
          enabled: false
        }
      },
      legend: {
        offsetY: -50,
        position: 'top',
        horizontalAlign: 'right'
      }
    }
    
    var chartArea = new ApexCharts(document.querySelector('#area-adwords'), optionsArea);
    chartArea.render();
  }
  catch(err) {
    document.querySelector('#area-adwords').innerHTML = `<h5 class="w-text-grey">Error occurred.</h5>`
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



//drawTrendChart()

// ============== Event Listeners =======================
$("#sub-per-class").on('change', getSubjectPerformance)
$("#sub-per-term").on('change', getSubjectPerformance)
$("#class-per-term").on('change', getClassPerformance)
$("#pass-fail-term").on('change', getPassFailRate)
$("#pass-fail-class").on('change', getPassFailRate)
$("#fee-coll-term").on('change', getFeesData)
$(`#fees-break-term`).on('change', getFeesBreakdown)
$(`#fees-break-class`).on('change', getFeesBreakdown)
$(`#month-filter`).on('change', getPayrollData)
$(`#year-filter`).on('change', getPayrollData)
$(`#level-cat`).on('change', staffPerformanceData)
$(`#level-term`).on('change', staffPerformanceData)
$(`#level-session`).on('change', staffPerformanceData)
$("#top-sub-class").on('change', () => {getPerformingSubjects("top")})
$("#top-sub-term").on('change', () => {getPerformingSubjects("top")})
$("#low-sub-class").on('change', () => {getPerformingSubjects("low")})
$("#low-sub-term").on('change', () => {getPerformingSubjects("low")})

  
