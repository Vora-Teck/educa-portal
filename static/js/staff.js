function getData() {

    showLoader("Loading Data...")
  
    admin.school.schoolData({
        params: {page: "staff"},
        onSuccess: (data) => {
                //console.log(data);
                let d = data.data;
                if(data.status == 'success') {
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
    admin.staff.staffList({
        params: {staff_id: id},
        onSuccess: (data) => {
            console.log(data);
            if(data.status == 'success') {
                    
            }
            else {
                pushNotification("n_error", data.message, 3000);
            }
        },
        onError: (error) => {
            console.error(error);
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
        addFormValid = false;
    }
    else {
        elem.removeClass('error');
        elem.siblings(".error-msg").removeClass('active');
    }
    return value;
}

$(".add-staff-form .req").on('input', function() {validate($(this))});
$(".add-staff-form .req2").on('change', function() {validate($(this))})



  
  