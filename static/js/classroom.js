showLoader("Loading Data...")

function getData() {

    admin.school.schoolData({
        params: {page: "class"},
        onSuccess: (data) => {
                //console.log(data);
                if(data.status == 'success') {
                    let d = data.data;
                    $(".class-no").html(digify(d.total_classes));
                    $(".sub-no").html(digify(d.total_subjects));
                    $(".mat-no").html(digify(d.total_curriculum))
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

/* =========== Classroom Section =============== */
function getLevels() {
    admin.classroom.getClassLevels({
        params: {exclude: "true"},
            onSuccess: (data) => {
                //console.log(data)
                let d = data.data
                $("#cl-level").empty().append(`<option value="" selected>Select Level</option>`)
                for(let i in d) {
                    let temp = `<option value="${d[i].id}">${d[i].title}</option>`;
                    $("#cl-level").append(temp)
                }
            },
            onError: (error) => console.error(error)
    })
}
function getStaff() {
    admin.staff.staffList({
        params: {page:1, pagesize:200},
            onSuccess: (data) => {
                //console.log(data)
                let d = data.data
                $("#cl-staff").empty().append(`<option value="" selected>No staff selected</option>`)
                $("#cl-staff2").empty().append(`<option value="" selected>No staff selected</option>`)
                $("#cur-staff").empty().append(`<option value="" selected>No staff selected</option>`)
                for(let i in d) {
                    let temp = `<option value="${d[i].id}">${d[i].firstName} ${d[i].lastName} (${d[i].qualification})</option>`;
                    $("#cl-staff").append(temp)
                    $("#cl-staff2").append(temp)
                    $("#cur-staff").append(temp)
                }
            },
            onError: (error) => console.error(error)
    })
}
getLevels()
getStaff()

function getClassrooms() {
    $(".class-list").empty()
    $(".class-list2").empty()
    $("#class-filter").empty()
    $("#class-filter").append(`<option selected value="">All Classes</option>`)
    let loader = `<tr>
        <td colspan="5" class="">
        <i class="fa fa-spinner rotate"></i>&nbsp;&nbsp;&nbsp;Processing...
        </td>
    </tr>`;
    $('.class-list').append(loader)
    admin.classroom.getClassrooms({
            onSuccess: (data) => {
                $(".class-list").empty()
                //console.log(data)
                if(data.status == "success") {
                    let d = data.data;
                    for(let i in d) {
                        $("#class-filter").append(`<option value="${d[i].id}">${d[i].level.title}</option>`)
                        let temp = `
                        <tr class="class-rows" data-id="${d[i].level.title}">
                            <td>
                            ${d[i].level.title}
                            </td>
                            <td>
                            ${d[i].teacher?.firstName || '<i class="w-small w-text-gray">No staff assigned</i>'} ${d[i].teacher?.lastName || ''}
                            </td>
                            <td>
                            ${d[i].level.category}
                            </td>
                            <td>
                            ${d[i].data?.total_students || '0'} (${d[i].data?.female || '0'}F, ${d[i].data?.male || '0'}M)
                            </td>
                            <td class="w-text-gray h4">
                                <a class="emp-det-link tooltipa" href="#" data-id="${d[i].id}">
                                    <i class="fa fa-edit"></i>&nbsp;&nbsp;&nbsp;
                                    <span class="tooltiptext w-card">Edit ${d[i].level.title} Class</span>
                                </a>
                                <a class="emp-del-link tooltipa" href="#" data-id="${d[i].id}">
                                    <i class="fa fa-trash"></i>&nbsp;&nbsp;&nbsp;
                                    <span class="tooltiptext w-card">Delete ${d[i].level.title} Class</span>
                                </a>
                            </td>
                        </tr>`;
                        $('.class-list').append(temp)

                        let temp2 = `
                        <div class="custom-control custom-checkbox">
                            <input type="checkbox" class="custom-control-input" value="${d[i].id}" id="class_${d[i].id}" name="class_ids">
                            <label class="custom-control-label" for="class_${d[i].id}">${d[i].level.title}</label>
                        </div>`;
                        $(".class-list2").append(temp2)
                    }
                    $('.emp-det-link').click(function(e) {
                        e.preventDefault();
                        let id = $(this).data('id');
                        getClassroom(id, "update")
                    })
                    $('.emp-del-link').click(function(e) {
                        e.preventDefault();
                        let id = $(this).data('id');
                        getClassroom(id, "delete")
                    })

                }
                else {
                    let temp = `<tr>
                        <td colspan="5">
                        ${data.message}. <span class="w-text-red" onclick="getClassrooms()">click here </span>to try again
                        </td>
                    </tr>`;
                    $('.class-list').html(temp)
                }
            },
            onError: (error) => {
                console.error(error)
                let temp = `<tr>
                        <td colspan="5">
                        Error occurred.  Kindly check your internet connection and <span class="w-text-red" onclick="getClassrooms()">click here </span>to try again
                        </td>
                    </tr>`;
                    $('.class-list').html(temp)
            }
    })
}
getClassrooms()


function addClassroom() {
    let class_level_id = $("#cl-level").val();
    let staff_id = $("#cl-staff").val();

    let formData = {class_level_id, staff_id};

    showLoader("Adding Classroom...")

    admin.classroom.addClassroom({
        formData: formData,
        onSuccess: (data) => {
            console.log(data)
            if(data.status == "success") {
                pushNotification("n_success", data.message, 5000);
                $(".add-class-form")[0].reset();
                getData();
                getLevels();
                getClassrooms();
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

function getClassroom(class_id, action) {
    showLoader("Processing...")

    admin.classroom.getClassrooms({
        params: {class_id},
        onSuccess: (data) => {
            //console.log(data)
            if(data.status == "success") {
                let d = data.data;
                $(".class-id").val(d.id)
                $(".class-name").html(d.level.title)
                if(d.teacher) {
                    $("#cl-staff2").val(d.teacher.id)
                } else {$("#cl-staff2").val('')}
                
                $(`.${action}-class-con`).addClass("active")
            }
            else {
                pushNotification("n_error", data.message, 3000)
            }
            hideLoader()
        },
        onError: (error) => {
            console.error(error)
            pushNotification("n_error", "Error occurred. Kindly check your internet connection", 3000)
            hideLoader()
        }
    })
}

function updateClassroom() {
    let class_id = $(".class-id").val();
    let staff_id = $("#cl-staff2").val();

    let formData = {class_id, staff_id};

    showLoader("Updating Classroom...")

    admin.classroom.updateClassroom({
        formData: formData,
        onSuccess: (data) => {
            //console.log(data)
            if(data.status == "success") {
                pushNotification("n_success", data.message, 5000);
                $(".update-class-form")[0].reset();
                $(".update-class-con").removeClass("active");
                getClassrooms();
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

function deleteClassroom() {
    let class_id = $(".class-id").val();
    let password = $("#class-delete-password").val();

    let formData = {class_id, password};

    showLoader("Deleting Classroom...")

    admin.classroom.deleteClassroom({
        formData: formData,
        onSuccess: (data) => {
            //console.log(data)
            if(data.status == "success") {
                pushNotification("n_success", data.message, 5000);
                $(".delete-class-form")[0].reset();
                $(".delete-class-con").removeClass("active");
                getData();
                getLevels();
                getClassrooms();
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

/* ============= Subject Section ================= */
var selected_courses = [];

function getCourses() {
    admin.subject.getCourses({
            onSuccess: (data) => {
                //console.log(data)
                let d = data.data
                $("#course-suggestions").empty()
                
                for(let i in d) {
                    let temp = `
                    <div class="suggestion-item" data-id="${d[i].id}" data-name="${d[i].title}">
                        ${d[i].title} <i class="w-small w-text-gray">(${d[i].categories.join(', ')})</i>
                    </div>`;
                    $("#course-suggestions").append(temp)
                }

                $(".suggestion-item").on('click', function() {
                    let id = $(this).data('id');
                    let nam = $(this).data('name');

                    let temp = `
                    <div class="sub-selected light-btn" data-id="${id}" data-name="${nam}">
                        <span>${nam}</span>
                        <span class="sub-canc">X</span>
                    </div>`;
                    $(".subs-selected").append(temp)
                    selected_courses.push(id)
                    //console.log(selected_courses)
                    $("#sub-course").val('');
                    filterCourses()

                    $(".sub-canc").on('click', function() {
                        let idx = $(this).parent('.sub-selected').data('id')
                        $(this).parent('.sub-selected').remove()
                        selected_courses = selected_courses.filter(item => item !== idx);
                        filterCourses()
                    })
                })
                
            },
            onError: (error) => console.error(error)
    })
}
getCourses();

function getSubjects() {
    let page = $('#emp_page2').val();
    let pagesize = 20;
    let search = $('#emp_search2').val();

    $('.subject-list').empty()
    loader = `<tr>
        <td colspan="4" class="">
        <i class="fa fa-spinner rotate"></i>&nbsp;&nbsp;&nbsp;Processing...
        </td>
    </tr>`;
    $('.subject-list').append(loader)

    admin.subject.getSubjects({
        params: {page, pagesize, search},
        onSuccess: (data) => {
                //console.log(data);
                $('.subject-list').empty()
                selected_courses.length = 0;
                if(data.status == 'success') {
                    let pages = data.total_pages
                    let count = data.total_count;
                    //$(".total_count").html(digify(count))
                    //$('.emp-no').html(data['total_items'])
                    $('#page_nos1').empty();
                    for(var i=0; i<pages; i++) {
                        let classN = "";
                        if((i+1) == data.page_number) {
                            classN = "active"
                        }
                        if((i+1) > (data.page_number + 1) || (i+1) < (data.page_number - 1)) {
                            continue
                        }
                        var temp = `<a href="#" class="page_no ${classN}" data-id="${i+1}">${i+1}</a>`;
                        $('#page_nos1').append(temp);
                    }
                    let current_p = $('#page_nos1 .page_no.active').data('id')
                    //console.log(current_p + ":" + typeof(current_p))
                    if((current_p - 1) > 0) {
                        let prev = `<a href="#" class="page_no" data-id="${current_p - 1}"><i class="fa fa-angle-left"></i></a>`
                        $('#page_nos1').prepend(prev);
                    }
                    if((current_p + 1) <= data.total_pages) {
                        let next = `<a href="#" class="page_no" data-id="${current_p + 1}"><i class="fa fa-angle-right"></i></a>`
                        $('#page_nos1').append(next);
                    }
                    $('#page_nos1 .page_no').click(function(e) {
                        e.preventDefault();
                        let page = $(this).data('id');
                        $('#emp_page2').val(page);
                        getSubjects();
                    })
                    if(data.data) {
                        let e = data.data;
                        for(var i in e) {
                            selected_courses.push(e[i].id)
                            let temp = `<tr class="staff-row">
                            <td>
                            <div class="w-bold-x">${e[i].title}</div>
                            </td>
                            <td style="white-space:wrap; max-width:250px !important;">${e[i].metadata.teachers?.join(', ') || '<i class="w-small w-text-gray">No teacher assigned</i>'}</td>
                            <td style="white-space:wrap; max-width:250px !important;">${e[i].metadata.classes?.join(', ') || '<i class="w-small w-text-gray">No classes added</i>'}</td>
                            <td class="w-text-gray h4">
                                <a class="emp-det-link2 tooltipa" href="#" data-id="${e[i].id}">
                                    <i class="fa fa-edit"></i>&nbsp;&nbsp;&nbsp;
                                    <span class="tooltiptext w-card">Edit ${e[i].title}</span>
                                </a>
                                <a class="emp-del-link2 tooltipa" href="#" data-id="${e[i].id}">
                                    <i class="fa fa-trash"></i>&nbsp;&nbsp;&nbsp;
                                    <span class="tooltiptext w-card">Delete ${e[i].title}</span>
                                </a>
                            </td>
                          </tr>`;
                          $('.subject-list').append(temp)
                        }
                        $('.emp-det-link2').click(function(e) {
                            e.preventDefault();
                            let id = $(this).data('id');
                            getSubject(id, "update")
                        })
                        $('.emp-del-link2').click(function(e) {
                            e.preventDefault();
                            let id = $(this).data('id');
                            getSubject(id, "delete");
                        })
                    }
                    else {
                        let temp = `<tr>
                        <td colspan="4" class="w-text-gray w-italic">${data.message}</td>
                        </tr>`;
                        $('.subject-list').append(temp)
                    }
                }
                else {
                    pushNotification("n_error", data.message, 3000);
                    let temp = `<tr>
                        <td colspan="4" class="w-text-gray w-italic">${data['message']}</td>
                        </tr>`;
                        $('.subject-list').append(temp)
                }
        },
        onError: (error) => {
                console.error(error);
                $('.subject-list').empty()
                pushNotification("n_network", "Error occurred. Kindly check your internet connection", 3000)
        }
  })
}

getSubjects()

function debounce(func, delay) {
    let timeout;
    return(...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        func(...args);
      }, delay);
    }
  }

var delayedSearch = debounce(getSubjects, 500)

function filterCourses() {
    let value = $("#sub-course").val().toLowerCase();

    if(value.trim() == "") {
        $("#course-suggestions").removeClass("active");
        return;
    }

    $(".suggestion-item").each((index, elem) => {
        let nam = $(elem).data('name').toLowerCase();
        let id = $(elem).data('id');
        //console.log(id)
        if(nam.includes(value) && !selected_courses.includes(id)) {$(elem).show()}
        else {$(elem).hide()}
    })

    $("#course-suggestions").addClass("active");
}

function addSubject() {
    let subject_ids = []
    $(".sub-selected").each((index, elem) => {
        let id = $(elem).data('id')
        subject_ids.push(id)
    })

    let formData = {subject_ids};

    showLoader("Adding Subjects...")

    admin.subject.addSubject({
        formData: formData,
        onSuccess: (data) => {
            //console.log(data)
            if(data.status == "success") {
                pushNotification("n_success", data.message, 5000);
                $(".add-sub-form")[0].reset();
                filterCourses()
                $(".subs-selected").empty();
                $(".add-sub-con").removeClass('active')
                getData();
                getSubjects();
                getAllSubjects();
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

function getSubject(subject_id, action) {
    showLoader("Processing...")
    //console.log(subject_id)

    admin.subject.getSubjects({
        params: {subject_id},
        onSuccess: (data) => {
            //console.log(data)
            if(data.status == "success") {
                let d = data.data;
                $(".sub-id").val(d.id)
                $(".sub-name").html(d.title)
                $("#sub-title").val(d.title)
                
                $(`.${action}-sub-con`).addClass("active")
            }
            else {
                pushNotification("n_error", data.message, 3000)
            }
            hideLoader()
        },
        onError: (error) => {
            console.error(error)
            pushNotification("n_error", "Error occurred. Kindly check your internet connection", 3000)
            hideLoader()
        }
    })
}

function updateSubject() {
    let subject_id = $(".sub-id").val();
    let title = $("#sub-title").val();

    let formData = {subject_id, title};

    showLoader("Updating Subject...")

    admin.subject.updateSubject({
        formData: formData,
        onSuccess: (data) => {
            //console.log(data)
            if(data.status == "success") {
                pushNotification("n_success", data.message, 5000);
                $(".update-sub-form")[0].reset();
                $(".update-sub-con").removeClass("active");
                getSubjects();
                getAllSubjects();
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

function deleteSubject() {
    let subject_id = $(".sub-id").val();
    let password = $("#sub-delete-password").val();

    let formData = {subject_id, password};

    showLoader("Deleting Subject...")

    admin.subject.deleteSubject({
        formData: formData,
        onSuccess: (data) => {
            //console.log(data)
            if(data.status == "success") {
                pushNotification("n_success", data.message, 5000);
                $(".delete-sub-form")[0].reset();
                $(".delete-sub-con").removeClass("active");
                getData();
                getSubjects();
                getAllSubjects();
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

/* ============= Curriculum Section ================= */
function getAllSubjects() {
    let pagesize = 300;
    $('#sub-filter').empty().append(`<option value="" selected>All Subjects</option>`)
    $('#sub-filter2').empty().append(`<option value="" selected>Select Subject</option>`)
    
    admin.subject.getSubjects({
        params: {pagesize},
        onSuccess: (data) => {
                //console.log(data);
                if(data.status == 'success') {
                    if(data.data) {
                        let e = data.data;
                        for(var i in e) {
                            $('#sub-filter').append(`<option value="${e[i].id}">${e[i].title}</option>`)
                            $('#sub-filter2').append(`<option value="${e[i].id}">${e[i].title}</option>`)
                        }
                    }
                }
        },
        onError: (error) => {
                console.error(error);
                pushNotification("n_network", "Error occurred. Kindly check your internet connection", 3000)
        }
  })
}
getAllSubjects()

function getSyllabi() {
    let page = $('#emp_page3').val();
    let pagesize = 10;
    let class_id = $("#class-filter").val();
    let subject_id = $("#sub-filter").val()
    let term = $("#term-filter").val()
    let sort_by = $("#sort-filter").val()
    //let search = $('#emp_search3').val();

    $('.curriculum-list').empty()
    loader = `<tr>
        <td colspan="6" class="">
        <i class="fa fa-spinner rotate"></i>&nbsp;&nbsp;&nbsp;Processing...
        </td>
    </tr>`;
    $('.curriculum-list').append(loader)

    admin.subject.getSyllabus({
        params: {page, pagesize, class_id, term, subject_id, sort_by},
        onSuccess: (data) => {
                //console.log(data);
                $('.curriculum-list').empty()
                if(data.status == 'success') {
                    let pages = data.total_pages
                    let count = data.total_count;
                    //$(".total_count").html(digify(count))
                    //$('.emp-no').html(data['total_items'])
                    $('#page_nos2').empty();
                    for(var i=0; i<pages; i++) {
                        let classN = "";
                        if((i+1) == data.page_number) {
                            classN = "active"
                        }
                        if((i+1) > (data.page_number + 1) || (i+1) < (data.page_number - 1)) {
                            continue
                        }
                        var temp = `<a href="#" class="page_no ${classN}" data-id="${i+1}">${i+1}</a>`;
                        $('#page_nos2').append(temp);
                    }
                    let current_p = $('#page_nos2 .page_no.active').data('id')
                    //console.log(current_p + ":" + typeof(current_p))
                    if((current_p - 1) > 0) {
                        let prev = `<a href="#" class="page_no" data-id="${current_p - 1}"><i class="fa fa-angle-left"></i></a>`
                        $('#page_nos2').prepend(prev);
                    }
                    if((current_p + 1) <= data.total_pages) {
                        let next = `<a href="#" class="page_no" data-id="${current_p + 1}"><i class="fa fa-angle-right"></i></a>`
                        $('#page_nos2').append(next);
                    }
                    $('#page_nos2 .page_no').click(function(e) {
                        e.preventDefault();
                        let page = $(this).data('id');
                        $('#emp_page3').val(page);
                        getSyllabi();
                    })
                    if(data.data) {
                        let e = data.data;
                        let terms = ["First", "Second", "Third"]
                        for(var i in e) {
                            let temp = `<tr class="staff-row">
                            <td>
                            <div class="w-bold-x">${e[i].subject.title}</div>
                            </td>
                            <td>${e[i].classroom.level.title}</td>
                            <td>${terms[e[i].term - 1]} Term</td>
                            <td class="w-center">${digify(e[i].no_of_topics)}</td>
                            <td>${e[i].teacher?.firstName || '<i class="w-small w-text-gray">No teacher assigned</i>'} ${e[i].teacher?.lastName || ``}</td>
                            <td class="w-text-gray h4">
                                <a class="emp-top-link3 tooltipa" href="#" data-id="${e[i].id}">
                                    <i class="fa fa-file-text"></i>&nbsp;&nbsp;&nbsp;
                                    <span class="tooltiptext w-card">View Topics</span>
                                </a>
                                <a class="emp-down-link3 tooltipa" href="#" data-id="${e[i].id}">
                                    <i class="fa fa-download"></i>&nbsp;&nbsp;&nbsp;
                                    <span class="tooltiptext w-card">Download Curriculum</span>
                                </a>
                                <a class="emp-det-link3 tooltipa" href="#" data-id="${e[i].id}">
                                    <i class="fa fa-edit"></i>&nbsp;&nbsp;&nbsp;
                                    <span class="tooltiptext w-card">Edit Curriculum</span>
                                </a>
                                <a class="emp-del-link3 tooltipa" href="#" data-id="${e[i].id}">
                                    <i class="fa fa-trash"></i>&nbsp;&nbsp;&nbsp;
                                    <span class="tooltiptext w-card">Delete Curriculum</span>
                                </a>
                            </td>
                          </tr>`;
                          $('.curriculum-list').append(temp)
                        }
                        $('.emp-det-link3').click(function(e) {
                            e.preventDefault();
                            let id = $(this).data('id');
                            getSyllabus(id, "update")
                        })
                        $('.emp-del-link3').click(function(e) {
                            e.preventDefault();
                            let id = $(this).data('id');
                            getSyllabus(id, "delete");
                        })
                        $('.emp-top-link3').click(function(e) {
                            e.preventDefault();
                            let id = $(this).data('id');
                            $(".cur-side-con").addClass("active")
                            getTopics(id)
                        })
                        $('.emp-down-link3').click(function(e) {
                            e.preventDefault();
                            let id = $(this).data('id');
                            downloadSyllabus(id);
                        })
                    }
                    else {
                        let temp = `<tr>
                        <td colspan="6" class="w-text-gray w-italic">${data.message}</td>
                        </tr>`;
                        $('.curriculum-list').append(temp)
                    }
                }
                else {
                    pushNotification("n_error", data.message, 3000);
                    let temp = `<tr>
                        <td colspan="6" class="w-text-gray w-italic">${data['message']}</td>
                        </tr>`;
                        $('.curriculum-list').append(temp)
                }
        },
        onError: (error) => {
                console.error(error);
                $('.curriculum-list').empty()
                pushNotification("n_network", "Error occurred. Kindly check your internet connection", 3000)
        }
  })
}

getSyllabi()

function addSyllabus() {
    let class_ids = $("input[name='class_ids']:checked").map(function() {
        return $(this).val();
      }).get();
    var term_ids = $("input[name='term_ids']:checked").map(function() {
            return $(this).val();
        }).get();
    let subject_id = $("#sub-filter2").val();

    if(!subject_id) {
        pushNotification("n_warning", "Kindly select a subject to continue", 3000);
        return;
    }
    if(class_ids.length === 0) {
        pushNotification("n_warning", "Kindly select at least one class to continue", 3000);
        return;
    }
    if(term_ids.length === 0) {
        pushNotification("n_warning", "Kindly select at least one term to continue", 3000);
        return;
    }

    let formData = {class_ids, term_ids, subject_id}

    showLoader("Adding Curriculum...")

    admin.subject.addSyllabus({
        formData: formData,
        onSuccess: (data) => {
            //console.log(data)
            if(data.status == "success") {
                pushNotification("n_success", data.message, 5000);
                $(".add-cur-form")[0].reset();
                $(".add-cur-con").removeClass('active')
                let ex = data.existing;
                let er = data.errors;
                if(ex.length > 0) {
                    let temp =  `
                    The following curriculum already exists for your school:
                    <ul class="mt-3" style="padding-left: 20px;">
                    ${ex.map((item, index) => {
                        return `<li>Term ${item.term} ${item.subject.title} for ${item.classroom.level.title}</li>`
                    })}
                    </ul>`;
                    pushNotification("n_info", temp, -1)
                }
                if(er.length > 0) {
                    let temp2 =  `
                    The following errors occurred while creating curriculum:
                    <ul class="mt-3" style="padding-left: 20px;">
                    ${er.map((item, index) => {
                        return `<li>${item}</li>`
                    })}
                    </ul>`;
                    pushNotification("n_error", temp2, -1)
                }
                getData();
                getSyllabi();
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

function getSyllabus(syllabus_id, action) {
    showLoader("Processing...")
    //console.log(subject_id)

    admin.subject.getSyllabus({
        params: {syllabus_id},
        onSuccess: (data) => {
            //console.log(data)
            if(data.status == "success") {
                let d = data.data;
                $(".cur-id").val(d.id)
                $(".cur-name").html(`Term ${d.term} ${d.subject.title} for ${d.classroom.level.title}`)
                $("#cur-staff").val(d.teacher?.id || '')
                
                $(`.${action}-cur-con`).addClass("active")
            }
            else {
                pushNotification("n_error", data.message, 3000)
            }
            hideLoader()
        },
        onError: (error) => {
            console.error(error)
            pushNotification("n_error", "Error occurred. Kindly check your internet connection", 3000)
            hideLoader()
        }
    })
}

function updateSyllabus() {
    let syllabus_id = $(".cur-id").val();
    let staff_id = $("#cur-staff").val();

    let formData = {syllabus_id, staff_id};

    showLoader("Updating Curriculum...")

    admin.subject.updateSyllabus({
        formData: formData,
        onSuccess: (data) => {
            //console.log(data)
            if(data.status == "success") {
                pushNotification("n_success", data.message, 5000);
                $(".update-cur-form")[0].reset();
                $(".update-cur-con").removeClass("active");
                getSyllabi();
                getSubjects();
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

function deleteSyllabus() {
    let syllabus_id = $(".cur-id").val();
    let password = $("#cur-delete-password").val();

    let formData = {syllabus_id, password};

    showLoader("Deleting Curriculum...")

    admin.subject.deleteSyllabus({
        formData: formData,
        onSuccess: (data) => {
            //console.log(data)
            if(data.status == "success") {
                pushNotification("n_success", data.message, 5000);
                $(".delete-cur-form")[0].reset();
                $(".delete-cur-con").removeClass("active");
                getData();
                getSyllabi();
                getSubjects();
            }
            else {
                checkResponse(data)
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

function getTopics(syllabus_id) {
    $(".top-list").empty();
    let loader = `<tr>
        <td colspan="4" class="">
        <i class="fa fa-spinner rotate"></i>&nbsp;&nbsp;&nbsp;Processing...
        </td>
    </tr>`;
    $(".top-list").append(loader)
    admin.subject.getTopics({
        params: {syllabus_id},
            onSuccess: (data) => {
                $(".top-list").empty()
                //console.log(data)
                if(data.status == "success") {
                    $(".cur-name").html(data.syllabus).data('id', syllabus_id)
                    if(data.data) {
                        let d = data.data;
                        for(let i in d) {
                            
                            let temp = `
                            <tr class="" data-id="${d[i].id}">
                                <td>${d[i].week}</td>
                                <td>${d[i].title}</td>
                                <td style="max-width: 250px;white-space: wrap;">${d[i].description}</td>
                                <td class="w-text-gray h4">
                                    <a class="top-det-link tooltipa" href="#" data-id="${d[i].id}">
                                        <i class="fa fa-edit"></i>&nbsp;&nbsp;&nbsp;
                                        <span class="tooltiptext w-card">Edit week ${d[i].week} Topic</span>
                                    </a>
                                    ${d[i].file ? `
                                    <a class="top-file-link tooltipa" href="#"  data-id="${base_url}${d[i].file}">
                                        <i class="fa fa-download"></i>&nbsp;&nbsp;&nbsp;
                                        <span class="tooltiptext w-card">Download week ${d[i].week} Document</span>
                                    </a>` : ``}
                                    <a class="top-del-link tooltipa" href="#" data-id="${d[i].id}">
                                        <i class="fa fa-trash"></i>&nbsp;&nbsp;&nbsp;
                                        <span class="tooltiptext w-card">Delete week ${d[i].week} Topic</span>
                                    </a>
                                </td>
                            </tr>`;
                            $('.top-list').append(temp)
                        }
                    }
                    else {
                        let temp = `<tr>
                        <td colspan="4">
                        ${data.message}.
                        </td>
                        </tr>`;
                        $('.top-list').html(temp)
                    }
                    $('.top-det-link').click(function(e) {
                        e.preventDefault();
                        let id = $(this).data('id');
                        getTopic(id, "update")
                    })
                    $('.top-del-link').click(function(e) {
                        e.preventDefault();
                        let id = $(this).data('id');
                        getTopic(id, "delete")
                    })
                    $('.top-file-link').click(function(e) {
                        e.preventDefault();
                        let id = $(this).data('id');
                        downloadFile(id)
                    })

                }
                else {
                    let temp = `<tr>
                        <td colspan="4">
                        ${data.message} <span class="w-text-red" onclick="getTopics(${syllabus_id})">click here </span>to try again
                        </td>
                    </tr>`;
                    $('.top-list').html(temp)
                }
            },
            onError: (error) => {
                console.error(error)
                let temp = `<tr>
                        <td colspan="4">
                        Error occurred.  Kindly check your internet connection and <span class="w-text-red" onclick="getClassrooms()">click here </span>to try again
                        </td>
                    </tr>`;
                    $('.top-list').html(temp)
            }
    })
}

function addTopic() {
    let syllabus_id = $(".cur-name").data('id')
    let week = $("#to-week").val();
    let title = $("#to-title").val();
    let description = $("#to-des").val();
    let file = $("#to-file")[0].files[0];
    let content = tinymce.get('to-content').getContent({format: 'html'})
    let formData = new FormData();
    formData.append("syllabus_id", syllabus_id);
    formData.append("week", week);
    formData.append("title", title);
    formData.append("description", description);
    formData.append("file", file);
    formData.append("content", content);

    //console.log(formData)
    showLoader("Adding Topic...")

    admin.subject.addTopic({
        formData: formData,
        onSuccess: (data) => {
            //console.log(data)
            if(data.status == "success") {
                pushNotification("n_success", data.message, 5000);
                $(".add-top-form")[0].reset();
                $(".custom-file-label").html(`Choose file`)
                getSyllabi()
                getTopics(syllabus_id)
                //$(".add-sub-con").removeClass('active')
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

function getTopic(topic_id, action) {
    showLoader("Processing...")
    //console.log(subject_id)

    admin.subject.getTopics({
        params: {topic_id},
        onSuccess: (data) => {
            //console.log(data)
            if(data.status == "success") {
                let d = data.data;
                $(".top-id").val(d.id)
                $(".top-name").html(`${d.week}`)

                // form fields
                $(".update-top-form")[0].reset()
                $(".custom-file-label").html(`Choose file`)
                $("#to-week2").val(d.week);
                $("#to-title2").val(d.title);
                $("#to-file3").html(
                    d.file ? `currently: <a href="${base_url}${d.file}">${d.file}</a>` : ``
                )
                $("#to-des2").val(d.description);
                tinymce.get('to-content2').setContent(d.content)
                
                $(`.${action}-top-con`).addClass("active")
            }
            else {
                pushNotification("n_error", data.message, 3000)
            }
            hideLoader()
        },
        onError: (error) => {
            console.error(error)
            pushNotification("n_error", "Error occurred. Kindly check your internet connection", 3000)
            hideLoader()
        }
    })
}

function updateTopic() {
    let syllabus_id = $(".cur-name").data('id')
    let topic_id = $(".top-id").val()
    let week = $("#to-week2").val();
    let title = $("#to-title2").val();
    let description = $("#to-des2").val();
    let file = $("#to-file2")[0].files[0];
    let content = tinymce.get('to-content2').getContent({format: 'html'})
    //console.log(content)
    let formData = new FormData();
    formData.append("topic_id", topic_id);
    formData.append("week", week);
    formData.append("title", title);
    formData.append("description", description);
    formData.append("file", file);
    formData.append("content", content);

    showLoader("Updating Topic...")

    admin.subject.updateTopic({
        formData: formData,
        onSuccess: (data) => {
            console.log(data)
            if(data.status == "success") {
                pushNotification("n_success", data.message, 5000);
                $(".update-top-form")[0].reset();
                $(".update-top-con").removeClass("active");
                getTopics(syllabus_id)
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

function deleteTopic() {
    let syllabus_id = $(".cur-name").data('id')
    let topic_id = $(".top-id").val();

    let formData = {topic_id};

    showLoader("Deleting Topic...")

    admin.subject.deleteTopic({
        formData: formData,
        onSuccess: (data) => {
            //console.log(data)
            if(data.status == "success") {
                pushNotification("n_success", data.message, 5000);
                $(".delete-top-form")[0].reset();
                $(".delete-top-con").removeClass("active");
                getSyllabi();
                getTopics(syllabus_id);
            }
            else {
                checkResponse(data)
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


initiateTiny()
// tinymce.get('blog-post').getContent({format: 'html'})
// tinymce.get('blog-post2').setContent(p.about)


// ========== Event Listeners ======================
$(".add-class-btn").click(function(e) {e.preventDefault();$(".add-class-con").addClass('active')})
$(".add-sub-btn").click(function(e) {e.preventDefault();$(".add-sub-con").addClass('active')})
$(".add-cur-btn").click(function(e) {e.preventDefault();$(".add-cur-con").addClass('active')})
$(".add-top-btn").click(function(e) {e.preventDefault();$(".add-top-con").addClass('active')})
$(".class-export-btn").click(function(e) {e.preventDefault();})
$(".sub-export-btn").click(function(e) {e.preventDefault();})
$(".cur-export-btn").click(function(e) {e.preventDefault();})

$("#sub-course").on('input', function() {filterCourses()})


$(".add-class-form").on('submit', function(e) {e.preventDefault();addClassroom()})
$(".update-class-form").on('submit', function(e) {e.preventDefault();updateClassroom()})
$(".delete-class-form").on('submit', function(e) {e.preventDefault();deleteClassroom()})
$(".add-sub-form").on('submit', function(e) {e.preventDefault();addSubject()})
$(".update-sub-form").on('submit', function(e) {e.preventDefault();updateSubject()})
$(".delete-sub-form").on('submit', function(e) {e.preventDefault();deleteSubject()})
$(".add-cur-form").on('submit', function(e) {e.preventDefault();addSyllabus()})
$(".update-cur-form").on('submit', function(e) {e.preventDefault();updateSyllabus()})
$(".delete-cur-form").on('submit', function(e) {e.preventDefault();deleteSyllabus()})
$(".add-top-form").on('submit', function(e) {e.preventDefault();addTopic()})
$(".update-top-form").on('submit', function(e) {e.preventDefault();updateTopic()})
$(".delete-top-form").on('submit', function(e) {e.preventDefault();deleteTopic()})
