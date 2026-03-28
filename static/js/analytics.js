window.Apex = {
  dataLabels: {
    enabled: false
  }
};
// ====================== General Data ======================
function getData() {

  showLoader("Loading Data...")

  admin.school.schoolData({
    params: {page: "analytic"},
      onSuccess: (data) => {
              //console.log(data);
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
      },
      onError: (error) => {
              console.error(error);
              pushNotification("n_network", "Error occurred. Kindly check your internet connection", 3000)
              hideLoader()
      }
  })
}
getData()
async function getTerms() {
  admin.calendar.termList({
          onSuccess: (data) => {
              //console.log(data)
              let d = data.data
              $(".term-filter").empty();
              for(let i in d) {
                  let temp = `<option value="${d[i].id}">${d[i].title} - ${d[i].session.title}</option>`;
                  $(".term-filter").append(temp)
              }
            getClassrooms();
            getClassPerformance();
          },
          onError: (error) => console.error(error)
  })
}
getTerms()

async function getClassrooms() {
  admin.classroom.getClassrooms({
      onSuccess: (data) => {
              //console.log(data);
              $('.class-filter').empty()
              if(data.status == 'success') {
                  if(data.data) {
                      let e = data.data;
                      for(var i in e) {
                          $('.class-filter').append(`<option value="${e[i].id}">${e[i].level.title}</option>`);
                          
                      }
                  }
                getSubjectPerformance()
                getPassFailRate()
                getPerformingSubjects("top")
                getPerformingSubjects("low")
              }
      },
      onError: (error) => {
              console.error(error);
              pushNotification("n_network", "Error occurred. Kindly check your internet connection", 3000)
      }
})
}

// ====================== Academic Report ========================
async function getSubjectPerformance() {
  let class_id = $("#sub-per-class").val();
  let term_id = $("#sub-per-term").val()

  admin.analytic.getSubjectPerformance({
    params: {class_id, term_id},
      onSuccess: (data) => {
              //console.log(data);
              if(data.status == 'success') {
                $("#bar1").empty()
                  subPerformanceChart(data.data)
              }
              else {
                pushNotification("n_network", data.message, 3000)
              }
      },
      onError: (error) => {
              console.error(error);
              pushNotification("n_network", "Error occurred. Kindly check your internet connection", 3000)
      }
})
}

async function getClassPerformance() {
  let term_id = $("#class-per-term").val()

  admin.analytic.getClassPerformance({
    params: {term_id},
      onSuccess: (data) => {
              //console.log(data);
              if(data.status == 'success') {
                $("#bar").empty()
                  classPerformanceChart(data.data)
              }
              else {
                pushNotification("n_network", data.message, 3000)
              }
      },
      onError: (error) => {
              console.error(error);
              pushNotification("n_network", "Error occurred. Kindly check your internet connection", 3000)
      }
})
}

async function getPassFailRate() {
  let class_id = $("#pass-fail-class").val();
  let term_id = $("#pass-fail-term").val()

  admin.analytic.getPassFailRate({
    params: {class_id, term_id},
      onSuccess: (data) => {
              //console.log(data);
              if(data.status == 'success') {
                $("#donutTop").empty()
                  passFailChart(data.data)
              }
              else {
                pushNotification("n_network", data.message, 3000)
              }
      },
      onError: (error) => {
              console.error(error);
              pushNotification("n_network", "Error occurred. Kindly check your internet connection", 3000)
      }
})
}

async function getPerformingSubjects(typ) {
  let class_id = $(`#${typ}-sub-class`).val();
  let term_id = $(`#${typ}-sub-term`).val()

  $(`.${typ}-sub-list`).empty()

  admin.analytic.getPerformingSubjects({
    params: {class_id, term_id, type:typ},
      onSuccess: (data) => {
        //console.log(data);
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
      },
      onError: (error) => {
        console.error(error);
        pushNotification("n_network", "Error occurred. Kindly check your internet connection", 3000)
      }
})
}



// For Admin
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
$("#top-sub-class").on('change', () => {getPerformingSubjects("top")})
$("#top-sub-term").on('change', () => {getPerformingSubjects("top")})
$("#low-sub-class").on('change', () => {getPerformingSubjects("low")})
$("#low-sub-term").on('change', () => {getPerformingSubjects("low")})

  
