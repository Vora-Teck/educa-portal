function getData() {

    showLoader("Loading Data...")
  
    admin.school.schoolData({
        params: {page: "staff"},
        onSuccess: (data) => {
                //console.log(data);
                if(data.status == 'success') {
                    let d = data.data;
                    $("#pry-f").text(digify(d.primary.female, false))
                    $("#pry-m").text(digify(d.primary.male, false))
                    $("#pry-t").text(digify((d.primary.female + d.primary.male), false))

                    $("#jun-f").text(digify(d.junior.female, false))
                    $("#jun-m").text(digify(d.junior.male, false))
                    $("#jun-t").text(digify((d.junior.female + d.junior.male), false))

                    $("#sen-f").text(digify(d.senior.female, false))
                    $("#sen-m").text(digify(d.senior.male, false))
                    $("#sen-t").text(digify((d.senior.female + d.senior.male), false))
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

function getStaff() {
    let page = $('#emp_page').val();
    let pagesize = 20;
    let search = $('#emp_search').val();

    $('.staff-list').empty()
    loader = `<tr>
        <td colspan="7" class="">
        <i class="fa fa-spinner rotate"></i>&nbsp;&nbsp;&nbsp;Processing...
        </td>
    </tr>`;
    $('.staff-list').append(loader)

    admin.staff.staffList({
        params: {page, pagesize, search},
        onSuccess: (data) => {
                //console.log(data);
                $('.staff-list').empty()
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
                        getStaff();
                    })
                    if(data.data) {
                        let e = data.data;
                        for(var i in e) {
                            let temp = `<tr class="staff-row">
                            <td>
                            <div class="w-bold-x">${e[i].staffId}</div>
                            </td>
                            <td>${e[i].firstName} ${e[i].lastName}</td>
                            <td>${e[i].gender[0].toUpperCase()}</td>
                            <td>${e[i].role}</td>
                            <td>${e[i].classes_assigned.join(', ')}</td>
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
                          $('.staff-list').append(temp)
                        }
                        $('.emp-det-link').click(function(e) {
                            e.preventDefault();
                            let id = $(this).data('id');
                            getTeacher(id)
                        })
                        $('.emp-del-link').click(function(e) {
                            e.preventDefault();
                            let id = $(this).data('id');
                            getTeacher(id);
                            $(".delete-staff-con").addClass("active")
                        })
                    }
                    else {
                        let temp = `<tr>
                        <td colspan="7">${data.message}</td>
                        </tr>`;
                        $('.staff-list').append(temp)
                    }
                }
                else {
                    pushNotification("n_error", data.message, 3000);
                    let temp = `<tr>
                        <td colspan="7">${data['message']}</td>
                        </tr>`;
                    $('.staff-list').append(temp)
                }
        },
        onError: (error) => {
                console.error(error);
                $('.staff-list').empty()
                pushNotification("n_network", "Error occurred. Kindly check your internet connection", 3000)
        }
  })
}

getStaff()


function getTeacher(id) {
    showLoader("Getting staff data...")
    admin.staff.staffList({
        params: {staff_id: id},
        onSuccess: (data) => {
            console.log(data);
            if(data.status == 'success') {
                if(data.status == 'success') {
                    $(".sta-side-con").addClass("active")
                    let d = data.data;
                    $(".sta-id-use").val(d.id)

                    $(".sta-name").html(`${d.firstName} ${d.lastName}`)
                    if(d.is_active) {
                        $(".sta-action").data('action', 'deactivate').html('Deactivate Staff')
                      }
                      else {
                        $(".sta-action").data('action', 'activate').html('Activate Staff')
                      }
                    $("#sta-name").html(`${d.firstName} ${d.middleName} ${d.lastName}`)
                    $("#sta-title").html(`${d.title}`)
                    $("#sta-id").html(`${d.staffId}`)
                    $("#sta-email").html(`${d.email}`)
                    $("#sta-phone").html(`${d.phone_number}`)
                    
                    if(d.image) {
                        $("#sta-image").attr('src', `${base_url}${d.image}`)
                    }
                    else {
                        $("#sta-image").attr('src', `/static/image/avatar.png`)
                    }
                }
            }
            else {
                pushNotification("n_error", data.message, 3000);
            }
            hideLoader()
        },
        onError: (error) => {
            console.error(error);
            hideLoader()
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

var delayedSearch = debounce(getStaff, 500)


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

var addFormValid = true;

$(".add-staff-form").on('submit', function(e) {
    e.preventDefault();
    addFormValid = true;
    let first_name = validate($("#st-fname"));
    let last_name = validate($("#st-lname"));
    let middle_name = $("#st-mname").val();
    let gender = validate($("#st-gender"));
    let phone_number = validate($("#st-phone"));
    let class_id = $("#st-class").val();
    let email = validate($("#st-email"));
    let address = validate($("#st-address"));
    let state = validate($("#st-state"));
    let lga = validate($("#st-lga"));
    let dob = validate($("#st-dob"));
    let qualification = validate($("#st-qua"));
    let role = validate($("#st-role"));
    let salary = $("#st-salary").val();

    let formData = {
        first_name, last_name, middle_name, gender, phone_number,
        email, address, state, class_id, lga, dob, qualification, role, salary
    }

    //console.log(formData)
    if(addFormValid === false) {
        return
    }
    showLoader("Onboarding Staff...")

    admin.staff.onboardStaff({
        formData: formData,
        onSuccess: (data) => {
            //console.log(data)
            if(data.status == "success") {
                pushNotification("n_success", data.message, 5000);
                $(".add-staff-form")[0].reset();
                getStaff();
                getData()
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

function deleteStaff() {

    let staff_id = $("#delete-id").val();
    let password = $("#delete-password").val();
  
    let formData = {staff_id, password}
  
    showLoader("Deleting Staff Records...")
    
    admin.staff.deleteStaff({
      formData: formData,
      onSuccess: (data) => {
          //console.log(data)
          if(data.status == "success") {
              pushNotification("n_success", data.message, 5000);
              $(".delete-staff-con").removeClass("active")
              $(".sta-side-con").removeClass("active")
              getStaff();
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
    var columns = $("input[name='columns']:checked").map(function() {
              return $(this).val();
            }).get();
    let format = $("#format").val();
  
    let formData = {columns,format}
    //console.log(formData)
  
    showLoader("Exporting List...")
  
      admin.staff.exportStaff({
          formData: formData,
          onSuccess: (data) => {
              //console.log(data)
              if(data.status == "success") {
                  d = data.data;
                  pushNotification("n_success", data.message, 5000);
                  downloadFile(`${base_url}${d.file_url}`,d.file_name)
                  $(".export-staff-form")[0].reset();
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

function validate(elem) {
    let value = elem.val()?.trim();
    if(!value || value == "") {
        elem.addClass('error');
        elem.siblings(".error-msg").addClass('active');
        addFormValid = false;
    }
    else {
        elem.removeClass('error');
        elem.siblings(".error-msg").removeClass('active');
    }
    return value;
}

var uploadBtn = document.querySelector("#image-upload");
uploadBtn.addEventListener("change", function() {
  var reader = new FileReader();
  var file = this.files[0];

  reader.onload = function(e) {
    document.querySelector("#sta-image").src = e.target.result;
  }

  reader.readAsDataURL(file)
  uploadImage()
})

function uploadImage() {
  let id = $(".sta-id-use").val();
  let image = $("#image-upload")[0].files[0];

  let formData = new FormData();
  formData.append("staff_id", id);
  formData.append("image", image)


  showLoader("Uploading image...")

  admin.staff.uploadImage({
    formData: formData,
    onSuccess: (data) => {
        //console.log(data)
        if(data.status == "success") {
          pushNotification("n_success", data.message, 3000)
        }
        else {
          pushNotification("n_error", data.message, -1)
          getTeacher(id)
        }
        hideLoader()
    },
    onError: (error) => {
      //hideLoader()
      getTeacher(id)
      console.error(error)
      pushNotification("n_network", "Error occurred. Kindly check your internet connection and try again", 3000)
    }
})
}

function updateStatus() {
    let staff_id = $(".sta-id-use").val();
    let action = $(".sta-action").data('action');
  
    let formData = {staff_id, action}
  
    var stat = {activate: "Activating", deactivate: "Deactivating"}
    showLoader(`${stat[action]} staff...`)
  
    admin.staff.staffStatus({
      formData: formData,
      onSuccess: (data) => {
          //console.log(data)
          if(data.status == "success") {
            pushNotification("n_success", data.message, 3000)
          }
          else {
            pushNotification("n_error", data.message, -1)
          }
          getTeacher(staff_id)
          getStaff()
          hideLoader()
      },
      onError: (error) => {
        hideLoader()
        console.error(error)
        pushNotification("n_network", "Error occurred. Kindly check your internet connection and try again", 3000)
      }
    })
  }


// ========== Event Listeners ======================
$(".delete-staff-form").on('submit', function(e) {e.preventDefault();deleteStaff()})
$(".export-staff-form").on('submit', function(e) {e.preventDefault();exportList()})

$(".add-staff-form .req").on('input', function() {validate($(this))});
$(".add-staff-form .req2").on('change', function() {validate($(this))})

$(".export-btn").click(function(e) {e.preventDefault(); $(".export-staff-con").addClass("active")})
$(".sta-del-btn").on('click', function() {$(".delete-staff-con").addClass("active")})
$(".sta-action").on('click', function() {updateStatus()})

  
  