function getData() {

    showLoader("Loading Data...")
  
    admin.school.schoolData({
        params: {page: "student"},
        onSuccess: (data) => {
                //console.log(data);
                if(data.status == 'success') {
                    let d = data.data;
                    let chart = d.chart;
                    let tab = d.table;
                    $(".std-data").empty();
                    for(let i in tab) {
                        var temp = `
                        <tr>
                            <td>${tab[i].title}</td>
                            <td class="w-center">${digify(tab[i].females)}</td>
                            <td class="w-center">${digify(tab[i].males)}</td>
                            <td class="w-center">${digify(tab[i].total)}</td>
                        </tr>`
                        $(".std-data").append(temp)
                    }

                    drawTrendChart(chart)
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


  function getClassrooms() {
    admin.classroom.getClassrooms({
            onSuccess: (data) => {
                //console.log(data)
                let d = data.data
                $(".class-filter").empty().append(`<option value="" selected>All Classes</option>`)
                $("#st-class").empty().append(`<option value="" selected>Select class</option>`)
                    for(let i in d) {
                            let temp = `<option value="${d[i].id}">${d[i].level.title}</option>`;
                            $(".class-filter").append(temp)
                            $("#st-class").append(temp)
                    }
            },
            onError: (error) => console.error(error)
    })
}
getClassrooms()

function getStudents() {
    let page = $('#emp_page').val();
    let pagesize = 20;
    let search = $('#emp_search').val();
    let sort_by = $(".sort-filter").val();
    let class_id = $(".class-filter").val();

    $('.student-list').empty()
    loader = `<tr>
        <td colspan="6" class="">
        <i class="fa fa-spinner rotate"></i>&nbsp;&nbsp;&nbsp;Processing...
        </td>
    </tr>`;
    $('.student-list').append(loader)

    admin.student.studentList({
        params: {page, pagesize, search, sort_by, class_id},
        onSuccess: (data) => {
                //console.log(data);
                $('.student-list').empty()
                if(data.status == 'success') {
                    let pages = data.total_pages
                    let count = data.total_count;
                    $(".total_count").html(digify(count))
                    $('.emp-no').html(data['total_items'])
                    $('.page_nos').empty();
                    for(var i=0; i<pages; i++) {
                        let classN = "";
                        if((i+1) == data.page_number) {
                            classN = "active"
                        }
                        if((i+1) > (data.page_number + 1) || (i+1) < (data.page_number - 1)) {
                            continue
                        }
                        var temp = `<a href="#" class="page_no ${classN}" data-id="${i+1}">${i+1}</a>`;
                        $('.page_nos').append(temp);
                    }
                    let current_p = $('.page_no.active').data('id')
                    //console.log(current_p + ":" + typeof(current_p))
                    if((current_p - 1) > 0) {
                        let prev = `<a href="#" class="page_no" data-id="${current_p - 1}"><i class="fa fa-angle-left"></i></a>`
                        $('.page_nos').prepend(prev);
                    }
                    if((current_p + 1) <= data.total_pages) {
                        let next = `<a href="#" class="page_no" data-id="${current_p + 1}"><i class="fa fa-angle-right"></i></a>`
                        $('.page_nos').append(next);
                    }
                    $('.page_no').click(function(e) {
                        e.preventDefault();
                        let page = $(this).data('id');
                        $('#emp_page').val(page);
                        getStudents();
                    })
                    if(data.data) {
                        let e = data.data;
                        for(var i in e) {
                            let temp = `<tr class="staff-row">
                            <td>
                            <div class="w-bold-x">${e[i].studentId}</div>
                            </td>
                            <td>${e[i].firstName} ${e[i].middleName} ${e[i].lastName}</td>
                            <td>${e[i].gender[0].toUpperCase()}</td>
                            <td>${e[i].classroom.level.title}</td>
                            <td class="w-bold-x">${e[i].is_active ? `
                                <span class="w-text-green">Active</span>` : `
                                <span class="w-text-red">Inactive</span>`}</td>
                            <td class="w-text-gray h4">
                                <a class="emp-det-link tooltipa" href="#" data-id="${e[i].id}">
                                    <i class="fa fa-eye"></i>&nbsp;&nbsp;&nbsp;
                                    <span class="tooltiptext w-card">View</span>
                                </a>
                                <a class="emp-del-link tooltipa" href="#" data-id="${e[i].id}">
                                    <i class="fa fa-trash"></i>&nbsp;&nbsp;&nbsp;
                                    <span class="tooltiptext w-card">Delete Record</span>
                                </a>
                                <a class="emp-rel-link tooltipa" href="#" data-id="${e[i].id}">
                                    <i class="fa fa-credit-card"></i>
                                    <span class="tooltiptext w-card">Print ID Card</span>
                                </a>
                            </td>
                          </tr>`;
                          $('.student-list').append(temp)
                        }
                        $('.emp-det-link').click(function(e) {
                            e.preventDefault();
                            let id = $(this).data('id');
                            getStudent(id)
                        })
                        $('.emp-com-link').click(function(e) {
                            e.preventDefault();
                            let id = $(this).data('id');
                            let or = $(this).data('name');
                            $('.msg-go-btn').data('id', id);
                            $('.message-content').html(`Are you sure you want to delete user '${or}'?<br>This action is permanent and cannot be reversed.`)
                            $('.message-con').addClass('active');
                        })
                    }
                    else {
                        let temp = `<tr>
                        <td colspan="6">${data.message}</td>
                        </tr>`;
                        $('.student-list').append(temp)
                    }
                }
                else {
                    pushNotification("n_error", data.message, 3000);
                    let temp = `<tr>
                        <td colspan="6">${data['message']}</td>
                        </tr>`;
                        $('.student-list').append(temp)
                }
        },
        onError: (error) => {
                console.error(error);
                $('.student-list').empty()
                pushNotification("n_network", "Error occurred. Kindly check your internet connection", 3000)
        }
  })
}
getStudents()


function getStudent(id) {
    showLoader("Getting student data...")
    admin.student.studentList({
        params: {student_id: id},
        onSuccess: (data) => {
            //console.log(data);
            if(data.status == 'success') {
                $(".std-side-con").addClass("active")
                let d = data.data;

                $("#std-name").html(`${d.firstName} ${d.lastName}`)
                $("#std-name2").html(`${d.firstName} ${d.middleName} ${d.lastName}`)
                $("#std-id").html(`${d.studentId}`)
                $("#std-class").html(`${d.classroom.level.title}`)
                $("#std-class2").html(`${d.classroom.level.title}`)
                $("#std-gender").html(`${d.gender}`)
                $("#std-dob").html(`${datify(d.dateOfBirth, false)}`)
                $("#std-age").html(`${dateDiff(d.dateOfBirth)}`)
                $("#std-date").html(`${datify(d.registration_date, false)}`)
                $("#std-address").html(`${d.address.address}, ${d.address.lga}, ${d.address.state}`)
                $("#std-address2").html(`${d.address.address}, ${d.address.lga}, ${d.address.state}`)
                $("#std-pname").html(`${d.parentInfo.name}`)
                $("#std-email").html(`${d.parentInfo.email}`)
                $("#std-section").html(`${d.classroom.level.category}`)
                if(d.image) {
                    $("#std-image").attr('src', `${base_url}${d.image}`)
                }
                else {
                    $("#std-image").attr('src', `/static/image/avatar.png`)
                }
                if(d.classroom.teacher) {
                    $("#std-teacher").html(`${d.classroom.teacher.firstName} ${d.classroom.teacher.lastName} (${d.classroom.teacher.qualification})`)
                }
                else {$("#std-teacher").html(`---`)}
                $("#std-phone").html(`${d.parentInfo.phone_number.join(', ')}`);

                let r = data.results;
                $(".std-res").empty();
                for(let i in r) {
                    let keys = Object.keys(r[i]);
                    let values = Object.values(r[i])

                    let keys_m = keys.map(k => `<li>${k}</li>`).join("")
                    let values_m = values.map(l => `<li data-id="${l}" class="w-text-blue w-bold-x">View Result</li>`).join("")

                    var temp = `
                    <tr>
                    <td>${i}</td>
                    <td>
                        <ul style="list-style-type:none;">
                        ${keys_m}
                        </ul>
                    </td>
                    <td>
                        <ul style="list-style-type:none;">${values_m}</ul>
                    </td>
                    </tr>`
                    $(".std-res").append(temp)
                }

                let fees = data.fees;
                $(".std-pay").empty();
                for(let i in fees) {
                    let temp = `
                    <tr>
                        <td>${fees[i].tuition.classroom.level.title}</td>
                        <td style="white-space:nowrap">${fees[i].tuition.term.title}</td>
                        <td>&#8358;${digify(fees[i].tuition.amount)}</td>
                        <td class="h3 w-text-center">${fees[i].is_paid ? `
                          <i class="fa fa-check-circle w-text-green"></i>` : `
                          <i class="fa fa-times-circle w-text-red"></i>`}</td>
                        <td>&#8358;${digify(fees[i].outstanding)}</td>
                        <td>
                          <div class="dropdown">
                            <i class="std-drop fa fa-ellipsis-v dropdown-toggle" data-toggle="dropdown"></i>
                            <div class="dropdown-menu">
                              <a class="dropdown-item" href="#">
                                <i class="fa fa-print"></i>&nbsp;
                                Print Receipt
                              </a>
                              ${fees[i].is_paid ? `
                                <a class="dropdown-item" href="#">
                                <i class="fa fa-times-circle"></i>&nbsp;
                                Mark As Unpaid
                                </a>` : `
                                <a class="dropdown-item" href="#">
                                <i class="fa fa-check-circle"></i>&nbsp;
                                Mark As Paid
                                </a>`}
                              
                              <a class="dropdown-item" href="#">
                              <i class="fa fa-trash"></i>&nbsp;
                              Delete Record
                              </a>
                            </div>
                          </div>
                        </td>
                    </tr>`;
                    $(".std-pay").append(temp)
                }
            }
            else {
                pushNotification("n_error", data.message, 3000);
            }
            hideLoader()
        },
        onError: (error) => {
            console.error(error);
            hideLoader();
            pushNotification("n_network", "Error occurred. Kindly check your internet connection", 3000)
        }
  })
}
function debounce(func, delay) {
    let timeout;
    return(...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        func(...args);
      }, delay);
    }
  }

var delayedSearch = debounce(getStudents, 500)


function getStates() {
    admin.misc.getStates({
            onSuccess: (data) => {
                    $("#st-state").empty().append(`<option value="" selected>Select State</option>`)
                    for(let i=0; i < data.length; i++) {
                            let temp = `<option value="${data[i]}">${data[i]}</option>`;
                            $("#st-state").append(temp)
                    }
            },
            onError: (error) => console.error(error)
    })
}
getStates()

function getLgas(state) {
    admin.misc.getLgas({
            params: { state },
            onSuccess: (data) => {
                    $("#st-lga").empty().append(`<option value="" selected>Select LGA</option>`)
                    for(let i=0; i < data.length; i++) {
                            let temp = `<option value="${data[i]}">${data[i]}</option>`;
                            $("#st-lga").append(temp)
                    }
            },
            onError: (error) => console.error(error)
    })
}


$("#st-state").on('change', function() {
    let state = $(this).val();
    if(state !== "") getLgas(state)
})

var createFormValid = true;

$(".add-student-form").on('submit', function(e) {
    e.preventDefault();
    createFormValid = true;
    let first_name = validate($("#st-fname"));
    let last_name = validate($("#st-lname"));
    let middle_name = $("#st-mname").val();
    let gender = validate($("#st-gender"));
    let dob = validate($("#st-dob"));

    let class_id = validate($("#st-class"));
    let address = validate($("#st-address"));
    let state = validate($("#st-state"));
    let lga = validate($("#st-lga"));

    let guardian_name = validate($("#st-pa-name"));
    let phone_number = validate($("#st-pa-phone"));
    let email = validate($("#st-pa-email"));
    

    let formData = {
        first_name, last_name, middle_name, gender, dob,
        class_id, address, state, lga, guardian_name,
        phone_number, email
    }

    //console.log(formData)
    if(createFormValid === false) {
        return
    }
    showLoader("Registering Student...")

    admin.student.addStudent({
        formData: formData,
        onSuccess: (data) => {
            //console.log(data)
            if(data.status == "success") {
                pushNotification("n_success", data.message, 5000);
                $(".add-student-form")[0].reset();
                getStudents();
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
})

function validate(elem) {
    let value = elem.val()?.trim();
    if(!value || value == "") {
        elem.addClass('error');
        elem.siblings(".error-msg").addClass('active');
        createFormValid = false;
    }
    else {
        elem.removeClass('error');
        elem.siblings(".error-msg").removeClass('active');
    }
    return value;
}

$(".add-student-form .req").on('input', function() {validate($(this))});
$(".add-student-form .req2").on('change', function() {validate($(this))})


window.Apex = {
    dataLabels: {
      enabled: false
    }
  };

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
        colors: ["#4f4ff5", "#50acf7"],
        series: [{
          name: "Males",
          data: d.males,
        }, {
          name: "Females",
          data: d.females,
        }],
        labels: d.classes,
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


  
  