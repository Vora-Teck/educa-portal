var months = {1: "January", 2: "February", 3: "March", 4: "April", 5: "May", 6: "June", 7: "July", 8: "August", 9: "September", 10: "October", 11: "November", 12: "December"}


async function getData() {

    showLoader("Loading Data...")

    let params = {page: "staff"}

    try {
        let data = await cache.fetchOrCache({
        func: "admin.school.schoolData",
        params, fetcher: admin.school.schoolData
        })

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
    }
    catch(error) {
        console.error(error);
        hideLoader()
        pushNotification("n_network", "Error occurred. Kindly check your internet connection", 3000)
    }
  }

  getData()


async function getClassrooms() {
    try {
        let data = await cache.fetchOrCache({
        func: "admin.classroom.getClassrooms",
        fetcher: admin.classroom.getClassrooms
        })

        let d = data.data
                $(".class-filter").empty().append(`<option value="" selected>All Classes</option>`)
                $("#st-class").empty().append(`<option value="" selected>Select class</option>`)
                    for(let i in d) {
                            let temp = `<option value="${d[i].id}">${d[i].title}${d[i].division}</option>`;
                            $(".class-filter").append(temp)
                            $("#st-class").append(temp)
                    }
    }
    catch(error) {
        console.error(error);
    }

}
getClassrooms()

async function getStaff() {
    let page = $('#emp_page').val();
    let pagesize = 20;
    let search = $('#emp_search').val();

    $('.staff-list').empty()
    loader = `<tr>
        <td colspan="8" class="">
        <i class="fa fa-spinner rotate"></i>&nbsp;&nbsp;&nbsp;Processing...
        </td>
    </tr>`;
    $('.staff-list').append(loader)

    let params = {page, pagesize, search}

    try {
        let data = await cache.fetchOrCache({
        func: "admin.staff.staffList",
        params, fetcher: admin.staff.staffList
        })

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
                                    <img class="w-circle" style="width:40px;height:40px;"
                                    src="${e[i].image ? `${e[i].image}` : `/static/image/avatar.png`}" 
                                    alt="" />
                                </td>
                            <td>
                            <div class="w-bold-x">${e[i].staffId}</div>
                            </td>
                            <td>${e[i].firstName} ${e[i].lastName}</td>
                            <td>${e[i].gender[0].toUpperCase()}</td>
                            <td>${e[i].role}</td>
                            <td>${e[i].classes_assigned.join(', ')}</td>
                            <td class="w-bold-x">${e[i].is_active ? `
                                <span class="w-text-green">Active</span>` : `
                                <span class="w-text-red">Inactive</span>`}
                            </td>

                            <td class="w-center">
                                <div class="dropdown">
                                    <i class="std-drop fa fa-ellipsis-v dropdown-toggle" data-toggle="dropdown"></i>
                                    <div class="dropdown-menu">
                                    <div class="dropdown-header">${e[i].firstName} ${e[i].lastName}</div>
                                        <a class="dropdown-item emp-det-link" data-id="${e[i].id}" href="#">
                                            <i class="fa fa-eye"></i>&nbsp;
                                            View Details
                                        </a>
                                        <a class="w-text-red w-hover-red dropdown-item emp-del-link" data-id="${e[i].id}" href="#">
                                            <i class="fa fa-trash"></i>&nbsp;
                                            Delete Records
                                        </a>
                                    
                                    </div>
                                </div>
                                
                            </td>
                          </tr>`;
                          $('.staff-list').append(temp)
                        }
                        $('.emp-det-link').click(function(e) {
                            e.preventDefault();
                            let id = $(this).data('id');
                            getTeacher(id)
                            getStaffPayroll(id);
                        })
                        $('.emp-del-link').click(function(e) {
                            e.preventDefault();
                            let id = $(this).data('id');
                            getTeacher(id);
                            getStaffPayroll(id);
                            $(".delete-staff-con").addClass("active")
                        })
                    }
                    else {
                        let temp = `<tr>
                        <td colspan="8">${data.message}</td>
                        </tr>`;
                        $('.staff-list').append(temp)
                    }
                }
                else {
                    pushNotification("n_error", data.message, 3000);
                    let temp = `<tr>
                        <td colspan="8">${data['message']}</td>
                        </tr>`;
                    $('.staff-list').append(temp)
                }
    }
    catch(error) {
        console.error(error);
        $('.staff-list').empty()
        pushNotification("n_network", "Error occurred. Kindly check your internet connection", 3000)
    }
}

getStaff()


async function getTeacher(id) {
    showLoader("Getting staff data...")
    let params = {staff_id: id}
    try {
        let data = await cache.fetchOrCache({
        func: "admin.staff.staffList",
        params, fetcher: admin.staff.staffList
        })

        //console.log(data);
            if(data.status == 'success') {
                if(data.status == 'success') {
                    $(".sta-side-con").addClass("active")
                    let d = data.data;
                    let b = data.bank_account;

                    $(".sta-id-use").val(d.id)

                    $(".sta-name").html(`${d.firstName} ${d.lastName}`)
                    //For edit form
                    getLgas(d.address.state, $("#st-lga2"))
                    $("#st-fname2").val(d.firstName)
                    $("#st-lname2").val(d.lastName)
                    $("#st-mname2").val(d.middleName)
                    $("#st-id2").val(d.staffId)
                    $("#st-phone2").val(d.phone_number)
                    $("#st-email2").val(d.email)
                    $("#st-address2").val(d.address.address)
                    $("#st-class2").val(d.classes_assigned.length > 0 ? d.classes_assigned[0] : '')
                    $("#st-state2").val(d.address.state)
                    $("#st-lga2").val(d.address.lga)
                    $("#st-qua2").val(d.qualification)
                    $("#st-role2").val(d.role)
                    $("#st-salary2").val(parseInt(d.salary))
                    // For content
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
                    $("#sta-phone2").html(`${d.phone_number}`)
                    $("#sta-qua").html(`${d.qualification}`)
                    $("#sta-address").html(`${d.address.address}, ${d.address.lga} LGA, ${d.address.state} State.`)
                    $("#sta-salary").html(`&#8358;${digify(d.salary, false)}`)
                    $("#sta-class").html(`${d.classes_assigned.join(', ')}`)
                    $("#sta-role").html(`${d.role}`)
                    $("#sta-ass-sub").html(`${data.roles.subjects.join(', ')}`)
                    $("#sta-ass-cl").html(`${data.roles.classes.join(', ')}`)
                    if(d.image) {
                        $("#sta-image").attr('src', `${d.image}`)
                    }
                    else {
                        $("#sta-image").attr('src', `/static/image/avatar.png`)
                    }
                    if(d.resume) {
                        $("#sta-resume").html(`
                            <a href="${d.resume}" target="_blank">
                                <button class="light-btn">
                                    <i class="fa fa-eye"></i>&nbsp;&nbsp;View
                                </button>
                            </a>
                        `)
                    }
                    else {
                        $("#sta-resume").html('<span class="w-text-gray">No resume provided.</span>')
                    }
                    if(b) {
                        $("#sta-acc-name").html(b.accountName)
                        $("#sta-acc-num").html(b.accountNumber)
                        $("#sta-bank").html(b.bank.bankName)
                    }
                    else {
                        $("#sta-acc-name").html(`<span class="w-text-gray">Not provided.</span>`)
                        $("#sta-acc-num").html(`<span class="w-text-gray">Not provided.</span>`)
                        $("#sta-bank").html(`<span class="w-text-gray">Not provided.</span>`)
                        $("#sta-status").html(`<span class="w-text-gray">-- --</span>`)
                    }
                    $('.accordion').eq(0).click()
                }
            }
            else {
                pushNotification("n_error", data.message, 3000);
            }
            hideLoader()
    }
    catch(error) {
        console.error(error);
        hideLoader()
        pushNotification("n_network", "Error occurred. Kindly check your internet connection", 3000)
    }
}

async function getStaffPayroll(id) {
    $(".sta-pay").empty()
    loader = `<tr>
        <td colspan="5" class="">
        <i class="fa fa-spinner rotate"></i>&nbsp;&nbsp;&nbsp;Processing...
        </td>
    </tr>`;
    $(".sta-pay").append(loader)

    let params = {staff_id: id};

    try {
        let data = await cache.fetchOrCache({
        func: "admin.payroll.getStaffPayrollHistory",
        params, fetcher: admin.payroll.getStaffPayrollHistory
        })

        //console.log(data)
            $(".sta-pay").empty()
            if(data.status == "success") {
                if(data.data) {
                    let d = data.data
                        
                    for(let i in d) {
                        let temp = `
                        <tr>
                        <td style="white-space: nowrap;">${months[d[i].month]} ${d[i].year}</td>
                        <td style="white-space: nowrap;">&#8358;${digify(d[i].amount)}</td>
                        <td style="white-space: nowrap;">
                            ${d[i].is_paid ? `
                                <span class="success-btn">Paid</span>` : `
                                <span class="danger-btn">Unpaid</span>`
                            }
                        </td>
                        </tr>`;

                        $(".sta-pay").append(temp)
                    }
                }
                else {
                    let temp = `<td colspan="5">${data.message}</td>`;
                    $(".sta-pay").append(temp)
                }
            }
    }
    catch(error) {
        console.error(error);
    }
}

//console.log(buildQueryParams({post_id:5, tag: "sci-fi"}))

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
getStates()


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


$("#st-state").on('change', function() {
    let state = $(this).val();
    if(state !== "") getLgas(state, $("#st-lga"))
  })
  
  $("#st-state2").on('change', function() {
    let state = $(this).val();
    if(state !== "") getLgas(state, $("#st-lga2"))
  })

var addFormValid = true;
var updateFormValid = true;

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
        onSuccess: async (data) => {
            //console.log(data)
            if(data.status == "success") {
                pushNotification("n_success", data.message, 5000);
                $(".add-staff-form")[0].reset();

                let page = $('#emp_page').val();
                let pagesize = 20;
                let search = $('#emp_search').val();

                let params = {page, pagesize, search}
                
            cache.clearFunction("admin.staff.staffList")
                await cache.refresh("admin.school.schoolData", {page: "staff"}, admin.school.schoolData)
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

async function updateStaff() {
    updateFormValid = true;

    let staff_id = $("#update-id").val();
    let middle_name = $("#st-mname2").val();

    let address = validate2($("#st-address2"));
    let state = validate2($("#st-state2"));
    let lga = validate2($("#st-lga2"));

    let phone_number = validate2($("#st-phone2"));
    let email = validate2($("#st-email2"));

    let qualification = validate2($("#st-qua2"));
    let role = validate2($("#st-role2"));
    let salary = $("#st-salary2").val();

    let addr = {address, state, lga}
    

    let formData = {
        staff_id, middle_name, address:addr, salary,
        phone_number, email, qualification, role,
    }

    //console.log(formData)
    if(updateFormValid === false) {
      pushNotification("n_warning", "Kindly fill in the required fields", 5000)
        return
    }
    showLoader("Updating Staff...")
    
    admin.staff.updateStaff({
      formData: formData,
      onSuccess: async (data) => {
          //console.log(data)
          if(data.status == "success") {
            $(".update-staff-con").removeClass("active")
            pushNotification("n_success", data.message, 5000);
            
            await cache.refresh("admin.staff.staffList", {staff_id}, admin.staff.staffList)
            let page = $('#emp_page').val();
            let pagesize = 20;
            let search = $('#emp_search').val();

            let params = {page, pagesize, search}
            await cache.refresh("admin.staff.staffList", params, admin.staff.staffList)
            getTeacher(staff_id);
            getStaff();
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

async function deleteStaff() {

    let staff_id = $("#delete-id").val();
    let password = $("#delete-password").val();
  
    let formData = {staff_id, password}
  
    showLoader("Deleting Staff Records...")
    
    admin.staff.deleteStaff({
      formData: formData,
      onSuccess: async (data) => {
          //console.log(data)
          if(data.status == "success") {
            pushNotification("n_success", data.message, 5000);
            $(".delete-staff-con").removeClass("active")
            $(".sta-side-con").removeClass("active")
            cache.removeCache("admin.staff.staffList", {staff_id})
            
            let page = $('#emp_page').val();
            let pagesize = 20;
            let search = $('#emp_search').val();

            let params = {page, pagesize, search}
            cache.clearFunction("admin.staff.staffList")
            await cache.refresh("admin.school.schoolData", {page: "staff"}, admin.school.schoolData)
            
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
                  downloadFile(`${d.file_url}`,d.file_name)
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

async function uploadImage() {
  let id = $(".sta-id-use").val();
  let image = $("#image-upload")[0].files[0];

  let formData = new FormData();
  formData.append("staff_id", id);
  formData.append("image", image)


  showLoader("Uploading image...")

  admin.staff.uploadImage({
    formData: formData,
    onSuccess: async (data) => {
        //console.log(data)
        if(data.status == "success") {
            pushNotification("n_success", data.message, 3000)
            await cache.refresh("admin.staff.staffList", {staff_id: id}, admin.staff.staffList)
            let page = $('#emp_page').val();
            let pagesize = 20;
            let search = $('#emp_search').val();

            let params = {page, pagesize, search}
            await cache.refresh("admin.staff.staffList", params, admin.staff.staffList)
            getTeacher(id);
            getStaff();
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

async function updateStatus() {
    let staff_id = $(".sta-id-use").val();
    let action = $(".sta-action").data('action');
  
    let formData = {staff_id, action}
  
    var stat = {activate: "Activating", deactivate: "Deactivating"}
    showLoader(`${stat[action]} staff...`)
  
    admin.staff.staffStatus({
      formData: formData,
      onSuccess: async (data) => {
          //console.log(data)
          if(data.status == "success") {
            pushNotification("n_success", data.message, 3000)
            await cache.refresh("admin.staff.staffList", {staff_id}, admin.staff.staffList)
            let page = $('#emp_page').val();
            let pagesize = 20;
            let search = $('#emp_search').val();

            let params = {page, pagesize, search}
            await cache.refresh("admin.staff.staffList", params, admin.staff.staffList)
            getTeacher(staff_id);
            getStaff();
          }
          else {
            pushNotification("n_error", data.message, -1)
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

function resetPassword() {
    let staff_id = $("#reset-id").val();
    let password = $("#reset-password").val();
    let cpassword = $("#c-reset-password").val();

    if(cpassword !== password) {
        pushNotification("n_warning", "Passwords do not match!", 3000);
        return;
    }
  
    let formData = {staff_id, password}

    showLoader(`Resetting Password...`)
  
    admin.staff.resetStaffPassword({
      formData: formData,
      onSuccess: (data) => {
          //console.log(data)
          if(data.status == "success") {
            $("#reset-password").val('')
            $("#c-reset-password").val('')
            $(".reset-staff-con").removeClass("active")
            pushNotification("n_success", data.message, 3000)
          }
          else {
            pushNotification("n_error", data.message, -1)
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


// ========== Event Listeners ======================
$(".delete-staff-form").on('submit', function(e) {e.preventDefault();deleteStaff()})
$(".export-staff-form").on('submit', function(e) {e.preventDefault();exportList()})
$(".update-staff-form").on('submit', function(e) {e.preventDefault();updateStaff()})
$(".reset-staff-form").on('submit', function(e) {e.preventDefault();resetPassword()})

$(".add-staff-form .req").on('input', function() {validate($(this))});
$(".add-staff-form .req2").on('change', function() {validate($(this))})

$(".update-staff-form .req").on('input', function() {validate2($(this))});
$(".update-staff-form .req2").on('change', function() {validate2($(this))});

$(".sta-edit-btn").on('click', function() {$(".update-staff-con").addClass("active")})
$(".export-btn").click(function(e) {e.preventDefault(); $(".export-staff-con").addClass("active")})
$(".sta-del-btn").on('click', function() {$(".delete-staff-con").addClass("active")})
$(".sta-reset-btn").on('click', function() {$(".reset-staff-con").addClass("active")})
$(".sta-action").on('click', function() {updateStatus()})

  
  