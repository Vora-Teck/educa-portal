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

  function getStates() {
    admin.misc.getStates({
            onSuccess: (data) => {
                    $("#st-state").empty().append(`<option value="" selected>Select State</option>`)
                    $("#st-state2").empty().append(`<option value="" selected>Select State</option>`)
                    for(let i=0; i < data.length; i++) {
                            let temp = `<option value="${data[i]}">${data[i]}</option>`;
                            $("#st-state").append(temp)
                            $("#st-state2").append(temp)
                    }
            },
            onError: (error) => console.error(error)
    })
}


  function getClassrooms() {
    admin.classroom.getClassrooms({
            onSuccess: (data) => {
                //console.log(data)
                let d = data.data
                $(".class-filter").empty().append(`<option value="" selected>All Classes</option>`)
                $("#st-class").empty().append(`<option value="" selected>Select class</option>`)
                $(".class-list").empty();
                for(let i in d) {
                  let temp = `<option value="${d[i].id}">${d[i].level.title}</option>`;
                  $(".class-filter").append(temp)
                  $("#st-class").append(temp)
                  let temp2 = `
                  <div class="custom-control custom-checkbox">
                    <input type="checkbox" class="custom-control-input" value="${d[i].id}" id="class_${d[i].id}" name="class_ids">
                    <label class="custom-control-label" for="class_${d[i].id}">${d[i].level.title}</label>
                  </div>`;
                  $(".class-list").append(temp2)
                }
            },
            onError: (error) => console.error(error)
    })
}

function getStudents() {
    let page = $('#emp_page').val();
    let pagesize = 20;
    let search = $('#emp_search').val();
    let sort_by = $(".sort-filter").val();
    let class_id = $(".class-filter").val();

    $('.student-list').empty()
    loader = `<tr>
        <td colspan="7" class="">
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
                                    <img class="w-circle" style="width:40px;height:40px;"
                                    src="${e[i].image ? `${base_url}${e[i].image}` : `/static/image/avatar.png`}" 
                                    alt="" />
                                </td>
                            <td class="w-bold-x">${e[i].firstName} ${e[i].middleName} ${e[i].lastName}</td>
                            <td>
                            <div>${e[i].studentId}</div>
                            </td>
                            <td class="w-center">${e[i].gender[0].toUpperCase()}</td>
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
                        $('.emp-del-link').click(function(e) {
                          e.preventDefault();
                          let id = $(this).data('id');
                          getStudent(id);
                          $(".delete-student-con").addClass("active")
                      })
                    }
                    else {
                        let temp = `<tr>
                        <td colspan="7">${data.message}</td>
                        </tr>`;
                        $('.student-list').append(temp)
                    }
                }
                else {
                    pushNotification("n_error", data.message, 3000);
                    let temp = `<tr>
                        <td colspan="7">${data['message']}</td>
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

getData()
getClassrooms()
getStudents()
getStates()


function getStudent(id) {
    showLoader("Getting student data...")
    admin.student.studentList({
        params: {student_id: id},
        onSuccess: (data) => {
            //console.log(data);
            if(data.status == 'success') {
                $(".std-side-con").addClass("active")
                let d = data.data;
                // for hidden inputs
                $(".std-id-use").val(d.id)
                // for titles
                $(".std-name").html(`${d.firstName} ${d.lastName}`)
                // for edit form
                getLgas(d.address.state, $("#st-lga2"))
                $("#st-fname2").val(d.firstName);
                $("#st-lname2").val(d.lastName);
                $("#st-mname2").val(d.middleName);
                $("#st-id2").val(d.studentId);
                $("#st-address2").val(d.address.address);
                $("#st-state2").val(d.address.state);
                $("#st-lga2").val(d.address.lga);
                let parent = d.parentInfo;
                for(let i in parent) {
                  let par = parent[i];
                  $(`#st-pa-name${3 + Number(i)}`).val(par.name)
                  $(`#st-pa-rel${3 + Number(i)}`).val(par.relationship)
                  $(`#st-pa-email${3 + Number(i)}`).val(par.email)
                  $(`#st-pa-phone${3 + Number(i)}`).val(par.phone_number)
                  $(`#st-pa-address${3 + Number(i)}`).val(par.address)
                }
                // for display
                $("#std-name2").html(`${d.firstName} ${d.middleName} ${d.lastName}`)
                $("#std-id").html(`${d.studentId}`)
                $("#std-class").html(`${d.classroom.level.title}`)
                $("#std-dept").html(`${d.classroom.level.department || '-- --'}`)
                $("#std-class2").html(`${d.classroom.level.title}`)
                $("#std-gender").html(`${d.gender}`)
                $("#std-dob").html(`${datify(d.dateOfBirth, false)}`)
                $("#std-age").html(`${dateDiff(d.dateOfBirth)}`)
                $("#std-date").html(`${datify(d.registration_date, false)}`)
                $("#std-address").html(`${d.address.address}, ${d.address.lga} LGA, ${d.address.state} State.`)
                $("#std-address2").html(`${d.address.address}, ${d.address.lga} LGA, ${d.address.state} State.`)
                $(".par-info").html(`
                  ${d.parentInfo.map((item, index) => {
                    return `
                      <tr>
                        <td colspan="2">Parent/Guardian ${Number(index + 1)}</td>
                      </tr>
                      <tr>
                        <td class="w-text-gray">Parent/Guardian Name:</td>
                        <td>${item.name}</td>
                      </tr>
                      <tr>
                        <td class="w-text-gray">Relationship:</td>
                        <td>${item.relationship}</td>
                      </tr>
                      <tr>
                        <td class="w-text-gray">Email Address:</td>
                        <td>${item.email}</td>
                      </tr>
                      <tr>
                        <td class="w-text-gray">Phone Number:</td>
                        <td>${item.phone_number}</td>
                      </tr>
                      <tr>
                        <td class="w-text-gray">Address:</td>
                        <td>${item.address}</td>
                      </tr>
                    `
                  }).join('')}
                `)
                $("#std-section").html(`${d.classroom.level.category}`)
                if(d.is_active) {
                  $(".std-action").data('action', 'deactivate').html('Deactivate Student')
                }
                else {
                  $(".std-action").data('action', 'activate').html('Activate Student')
                }
                if(d.image) {
                    $("#std-image").attr('src', `${base_url}${d.image}`)
                }
                else {
                    $("#std-image").attr('src', `/static/image/student.png`)
                }
                if(d.classroom.teacher) {
                    $("#std-teacher").html(`${d.classroom.teacher.firstName} ${d.classroom.teacher.lastName} (${d.classroom.teacher.qualification})`)
                }
                else {$("#std-teacher").html(`---`)}
                
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
                console.log(fees)
                for(let i in fees) {
                  let t = fees[i].tuition;
                    let temp = `
                    <tr>
                        <td>
                        ${t.term.session.title}
                        </td>
                        <td style="white-space:nowrap">${t.term.title}</td>
                        <td>&#8358;${digify(t.amount)}</td>
                        <td class=" w-text-center">${fees[i].is_paid ? `
                          <span class="success-btn">Paid</span>` : `
                          <span class="danger-btn">Unpaid</span>`}</td>
                        <td>&#8358;${digify(fees[i].outstanding)}</td>
                        <!--
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
                        -->
                    </tr>`;
                    $(".std-pay").append(temp)
                }
                $('.accordion').eq(0).click()
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




function getLgas(state, elem) {
    admin.misc.getLgas({
            params: { state },
            onSuccess: (data) => {
                    elem.empty().append(`<option value="" selected>Select LGA</option>`)
                    for(let i=0; i < data.length; i++) {
                            let temp = `<option value="${data[i]}">${data[i]}</option>`;
                            elem.append(temp)
                    }
            },
            onError: (error) => console.error(error)
    })
}


var createFormValid = true;
var updateFormValid = true;

function addStudent() {
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

    let parent_name1 = validate($("#st-pa-name1"));
    let parent_rel1 = validate($("#st-pa-rel1"));
    let parent_email1 = validate($("#st-pa-email1"));
    let parent_phone1 = validate($("#st-pa-phone1"));
    let parent_address1 = validate($("#st-pa-address1"));

    let parent_name2 = $("#st-pa-name2").val();
    let parent_rel2 = $("#st-pa-rel2").val();
    let parent_email2 = $("#st-pa-email2").val();
    let parent_phone2 = $("#st-pa-phone2").val();
    let parent_address2 = $("#st-pa-address2").val();

    let parent_info = [
      {name:parent_name1, relationship:parent_rel1, phone_number:parent_phone1, email:parent_email1, address:parent_address1},
      {name:parent_name2, relationship:parent_rel2, phone_number:parent_phone2, email:parent_email2, address:parent_address2}
    ]
    

    let formData = {
        first_name, last_name, middle_name, gender, dob,
        class_id, address, state, lga, parent_info
    }

    //console.log(formData)
    if(createFormValid === false) {
      pushNotification("n_warning", "Kindly fill in the required fields", 5000)
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
                getData();
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

function updateStudent() {
    updateFormValid = true;

    let student_id = $("#update-id").val();
    let middle_name = $("#st-mname2").val();

    let address = validate2($("#st-address2"));
    let state = validate2($("#st-state2"));
    let lga = validate2($("#st-lga2"));

    let parent_name1 = validate2($("#st-pa-name3"));
    let parent_rel1 = validate2($("#st-pa-rel3"));
    let parent_email1 = validate2($("#st-pa-email3"));
    let parent_phone1 = validate2($("#st-pa-phone3"));
    let parent_address1 = validate2($("#st-pa-address3"));

    let parent_name2 = $("#st-pa-name4").val();
    let parent_rel2 = $("#st-pa-rel4").val();
    let parent_email2 = $("#st-pa-email4").val();
    let parent_phone2 = $("#st-pa-phone4").val();
    let parent_address2 = $("#st-pa-address4").val();

    let parent_info = [
      {name:parent_name1, relationship:parent_rel1, phone_number:parent_phone1, email:parent_email1, address:parent_address1},
      {name:parent_name2, relationship:parent_rel2, phone_number:parent_phone2, email:parent_email2, address:parent_address2}
    ]

    let formData = {
        student_id, middle_name, address, state, lga,
        parent_info
    }

    //console.log(formData)
    if(updateFormValid === false) {
      pushNotification("n_warning", "Kindly fill in the required fields", 5000)
        return
    }
    showLoader("Updating Student...")
    
    admin.student.updateStudent({
      formData: formData,
      onSuccess: (data) => {
          //console.log(data)
          if(data.status == "success") {
            $(".update-student-con").removeClass("active")
              pushNotification("n_success", data.message, 5000);
              getStudent(student_id);
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
}

function deleteStudent() {

  let student_id = $("#delete-id").val();
  let password = $("#delete-password").val();

  let formData = {student_id, password}

  showLoader("Deleting Student Records...")
  
  admin.student.deleteStudent({
    formData: formData,
    onSuccess: (data) => {
        //console.log(data)
        if(data.status == "success") {
            pushNotification("n_success", data.message, 5000);
            $(".delete-student-con").removeClass("active")
            $(".std-side-con").removeClass("active")
            getStudents();
            getData();
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

function exportList() {
  let class_ids = $("input[name='class_ids']:checked").map(function() {
            return $(this).val();
          }).get();
  var columns = $("input[name='columns']:checked").map(function() {
            return $(this).val();
          }).get();
  let format = $("#format").val();

  let formData = {class_ids, columns,format}
  //console.log(formData)

  showLoader("Exporting List...")

    admin.student.exportStudents({
        formData: formData,
        onSuccess: (data) => {
            //console.log(data)
            if(data.status == "success") {
                d = data.data;
                pushNotification("n_success", data.message, 5000);
                downloadFile(`${base_url}${d.file_url}`,d.file_name)
                $(".export-student-form")[0].reset();
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

var uploadBtn = document.querySelector("#image-upload");
uploadBtn.addEventListener("change", function() {
  var reader = new FileReader();
  var file = this.files[0];

  reader.onload = function(e) {
    document.querySelector("#std-image").src = e.target.result;
  }

  reader.readAsDataURL(file)
  uploadImage()
})

function uploadImage() {
  let id = $(".std-id-use").val();
  let image = $("#image-upload")[0].files[0];

  let formData = new FormData();
  formData.append("student_id", id);
  formData.append("image", image)


  showLoader("Uploading image...")

  admin.student.updateStudentPhoto({
    formData: formData,
    onSuccess: (data) => {
        //console.log(data)
        if(data.status == "success") {
          pushNotification("n_success", data.message, 3000)
        }
        else {
          pushNotification("n_error", data.message, -1)
          getStudent(id)
        }
        hideLoader()
    },
    onError: (error) => {
      hideLoader()
      console.error(error)
      pushNotification("n_network", "Error occurred. Kindly check your internet connection and try again", 3000)
    }
})
}

function updateStatus() {
  let student_id = $(".std-id-use").val();
  let action = $(".std-action").data('action');

  let formData = {student_id, action}

  var stat = {activate: "Activating", deactivate: "Deactivating"}
  showLoader(`${stat[action]} student...`)

  admin.student.updateAccount({
    formData: formData,
    onSuccess: (data) => {
        //console.log(data)
        if(data.status == "success") {
          pushNotification("n_success", data.message, 3000)
        }
        else {
          pushNotification("n_error", data.message, -1)
        }
        getStudent(student_id)
        getStudents()
        hideLoader()
    },
    onError: (error) => {
      hideLoader()
      console.error(error)
      pushNotification("n_network", "Error occurred. Kindly check your internet connection and try again", 3000)
    }
  })
}

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

function validate2(elem) {
  let value = elem.val()?.trim();
  if(!value || value == "") {
      elem.addClass('error');
      elem.siblings(".error-msg").addClass('active');
      updateFormValid = false;
  }
  else {
      elem.removeClass('error');
      elem.siblings(".error-msg").removeClass('active');
  }
  return value;
}

// ============== Event Listeners ================================
$(".add-student-form").on('submit', function(e) {e.preventDefault();addStudent()})
$(".update-student-form").on('submit', function(e) {e.preventDefault();updateStudent()})
$(".export-student-form").on('submit', function(e) {e.preventDefault();exportList()})
$(".delete-student-form").on('submit', function(e) {e.preventDefault();deleteStudent()})

$(".export-btn").click(function(e) {e.preventDefault(); $(".export-student-con").addClass("active")})
$(".std-action").on('click', function() {updateStatus()})
$(".std-edit-btn").on('click', function() {$(".update-student-con").addClass("active")})
$(".std-del-btn").on('click', function() {$(".delete-student-con").addClass("active")})

$(".add-student-form .req").on('input', function() {validate($(this))});
$(".add-student-form .req2").on('change', function() {validate($(this))});

$(".update-student-form .req").on('input', function() {validate2($(this))});
$(".update-student-form .req2").on('change', function() {validate2($(this))});

$("#st-state").on('change', function() {
  let state = $(this).val();
  if(state !== "") getLgas(state, $("#st-lga"))
})

$("#st-state2").on('change', function() {
  let state = $(this).val();
  if(state !== "") getLgas(state, $("#st-lga2"))
})

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


  
  