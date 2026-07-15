showLoader("Loading Data...")

function getData() {

    admin.school.schoolData({
        params: {page: "exam"},
        onSuccess: (data) => {
                //console.log(data);
                if(data.status == 'success') {
                    let d = data.data;
                    $(".class-no").html(digify(d.total_exams));
                    $(".sub-no").html(digify(d.active_exams));
                    $(".mat-no").html(digify(d.upcoming_exams))
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


function getTerms() {
    admin.calendar.termList({
            onSuccess: (data) => {
                //console.log(data)
                let d = data.data
                $("#term-filter").empty();
                $("#term-filter1").empty();
                $("#term-filter2").empty();
                $("#term-filter4").empty();
                $("#term-filter5").empty().prepend(`<option value="" selected>Select Term</option>`);
                for(let i in d) {
                    let temp = `<option value="${d[i].id}">${d[i].title} - ${d[i].session.title}</option>`;
                    $("#term-filter").append(temp)
                    $("#term-filter1").append(temp)
                    $("#term-filter2").append(temp)
                    $("#term-filter4").append(temp)
                    $("#term-filter5").append(temp)
                }
                getTests()
                getExams()
                getResults()
            },
            onError: (error) => console.error(error)
    })
}
function getSessions() {
    admin.calendar.sessionList({
            onSuccess: (data) => {
                //console.log(data)
                let d = data.data
                $("#session-filter").empty();
                for(let i in d) {
                    let temp = `<option value="${d[i].id}">${d[i].title}</option>`;
                    $("#session-filter").append(temp)
                }
            },
            onError: (error) => console.error(error)
    })
}
getSessions()

function getAllSubjects() {
    let pagesize = 300;
    
    admin.subject.getSubjects({
        params: {pagesize},
        onSuccess: (data) => {
                //console.log(data);
                $('#sub-filter').empty().append(`<option value="" selected>All Subjects</option>`)
                $('#sub-filter2').empty().append(`<option value="" selected>Select Subject</option>`)
                $('#sub-filter4').empty().append(`<option value="" selected>Select Subject</option>`)
                $('#sub-filter5').empty().append(`<option value="" selected>Select Subject</option>`)
                if(data.status == 'success') {
                    if(data.data) {
                        let e = data.data;
                        for(var i in e) {
                            $('#sub-filter').append(`<option value="${e[i].id}">${e[i].title}</option>`)
                            $('#sub-filter2').append(`<option value="${e[i].id}">${e[i].title}</option>`)
                            $('#sub-filter4').append(`<option value="${e[i].id}">${e[i].title}</option>`)
                            $('#sub-filter5').append(`<option value="${e[i].id}">${e[i].title}</option>`)
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

function getClassrooms() {
    $(".class-list2").empty()
    admin.classroom.getClassrooms({
        onSuccess: (data) => {
                //console.log(data);
                $('#class-filter').empty().append(`<option value="" selected>All Classes</option>`)
                $('#class-filter2').empty().append(`<option value="" selected>All Classes</option>`)
                $('#class-filter1').empty().append(`<option value="" selected>All Classes</option>`)
                $('#class-filter5').empty().append(`<option value="" selected>Select Classroom</option>`)
                if(data.status == 'success') {
                    if(data.data) {
                        let e = data.data;
                        for(var i in e) {
                            $('#class-filter').append(`<option value="${e[i].id}">${e[i].level.title}</option>`);
                            $('#class-filter2').append(`<option value="${e[i].id}">${e[i].level.title}</option>`);
                            $('#class-filter1').append(`<option value="${e[i].id}">${e[i].level.title}</option>`);
                            $('#class-filter5').append(`<option value="${e[i].id}">${e[i].level.title}</option>`);

                            let temp2 = `
                            <div class="custom-control custom-checkbox">
                                <input type="checkbox" class="custom-control-input" value="${e[i].id}" id="class_${e[i].id}" name="class_ids">
                                <label class="custom-control-label" for="class_${e[i].id}">${e[i].level.title}</label>
                            </div>`;
                            $(".class-list2").append(temp2)
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

function getStaff() {
    admin.staff.staffList({
        params: {page:1, pagesize:200},
            onSuccess: (data) => {
                //console.log(data)
                let d = data.data
                $(".staff-filter").empty().append(`<option value="" selected>No staff selected</option>`)
                for(let i in d) {
                    let temp = `<option value="${d[i].id}">${d[i].firstName} ${d[i].lastName} (${d[i].qualification})</option>`;
                    $(".staff-filter").append(temp)
                }
            },
            onError: (error) => console.error(error)
    })
}
getTerms()
getAllSubjects()
getClassrooms()
getStaff()

/* =========== Test Section =============== */

function getScoreSheet() {
    let class_id = $("#class-filter5").val();
    let subject_id = $("#sub-filter5").val()
    let term_id = $("#term-filter5").val()

    $('.score-sheet').empty()
    $(".sheet-btns").empty()
    $(".test_per").html(`0%`)
    $(".exam_per").html(`0%`)
    loader = `<tr>
        <td colspan="7" class="">
        <i class="fa fa-spinner rotate"></i>&nbsp;&nbsp;&nbsp;Processing...
        </td>
    </tr>`;
    $('.score-sheet').append(loader)

    let params = {class_id, term_id, subject_id}

    //console.log(params)

    admin.exam.getScoreSheet({
        params: params,
        onSuccess: (data) => {
            //console.log(data);
            $('.score-sheet').empty()
            if(data.status == 'success') {
                let e = data.data;
                let s = e.scores;

                $(".test_per").html(`${e.test_percentage}%`)
                $(".exam_per").html(`${e.exam_percentage}%`)

                if(e.test_id) {
                    $(".sheet-btns").append(`
                    <button class="dark-btn" data-id="${e.test_id}">Test Scores&nbsp;&nbsp;<i class="fa fa-plus-circle"></i></button>
                    `)
                }
                if(e.exam_id) {
                    $(".sheet-btns").append(`
                    <button class="dark-btn" data-id="${e.exam_id}">Exam Scores&nbsp;&nbsp;<i class="fa fa-plus-circle"></i></button>
                    `)
                }
                
                if(s.length > 0) {
                    for(var i in s) {
                        let temp = `
                            <tr class="staff-row score-row" data-name="${s[i].name.toLowerCase()} ${s[i].studentId.toLowerCase()}">
                                <td> 
                                    <img class="w-circle" style="width:40px;height:40px;"
                                        src="${s[i].image || `/static/image/avatar.png`}" alt="" />
                                </td>
                                <td>${s[i].name}</td>
                                <td>${s[i].studentId}</td>
                                <td class="w-center">${s[i].test}</td>
                                <td class="w-center">${s[i].exam}</td>
                                <td class="w-center">${s[i].average}</td>
                                <td class="w-center">${s[i].grade || 'N/A'}</td>
                            </tr>`;
                        $('.score-sheet').append(temp)
                    }
                }
                else {
                    let temp = `<tr>
                            <td colspan="7" class="w-text-gray w-italic">No score sheet found for this exam.</td>
                        </tr>`;
                    $('.score-sheet').append(temp) 
                }

                $(".sheet-btns button").on('click', function(e) {
                    e.preventDefault();
                    let id = $(this).data('id');
                    getScores(id)
                })
            }
            else {
                let temp = `<tr>
                        <td colspan="7" class="w-text-gray w-italic">${data.message}</td>
                    </tr>`;
                $('.score-sheet').append(temp)
            }
        },
        onError: (error) => {
                console.error(error);
                $('.score-sheet').empty()
                pushNotification("n_network", "Error occurred. Kindly check your internet connection", 3000)
        }
  })
}

function getTests() {
    let page = $('#emp_page3').val();
    let pagesize = 20;
    let class_id = $("#class-filter2").val();
    let subject_id = $("#sub-filter4").val()
    let term_id = $("#term-filter4").val()
    let exam_type = "test";

    $('.test-list').empty()
    loader = `<tr>
        <td colspan="6" class="">
        <i class="fa fa-spinner rotate"></i>&nbsp;&nbsp;&nbsp;Processing...
        </td>
    </tr>`;
    $('.test-list').append(loader)

    let params = {page, pagesize, class_id, term_id, subject_id, exam_type}

    //console.log(params)

    admin.exam.getExams({
        params: params,
        onSuccess: (data) => {
                //console.log(data);
                $('.test-list').empty()
                if(data.status == 'success') {
                    let pages = data.total_pages
                    //let count = data.total_count;
                    //$(".total_count").html(digify(count))
                    //$('.emp-no').html(data['total_items'])
                    $('#page_nos3').empty();
                    for(var i=0; i<pages; i++) {
                        let classN = "";
                        if((i+1) == data.page_number) {
                            classN = "active"
                        }
                        if((i+1) > (data.page_number + 1) || (i+1) < (data.page_number - 1)) {
                            continue
                        }
                        var temp = `<a href="#" class="page_no ${classN}" data-id="${i+1}">${i+1}</a>`;
                        $('#page_nos3').append(temp);
                    }
                    let current_p = $('#page_nos3 .page_no.active').data('id')
                    //console.log(current_p + ":" + typeof(current_p))
                    if((current_p - 1) > 0) {
                        let prev = `<a href="#" class="page_no" data-id="${current_p - 1}"><i class="fa fa-angle-left"></i></a>`
                        $('#page_nos3').prepend(prev);
                    }
                    if((current_p + 1) <= data.total_pages) {
                        let next = `<a href="#" class="page_no" data-id="${current_p + 1}"><i class="fa fa-angle-right"></i></a>`
                        $('#page_nos3').append(next);
                    }
                    $('#page_nos3 .page_no').click(function(e) {
                        e.preventDefault();
                        let page = $(this).data('id');
                        $('#emp_page3').val(page);
                        getTests();
                    })
                    if(data.data) {
                        let e = data.data;
                        
                        for(var i in e) {
                            let classes = e[i].classrooms;
                            let clas = ``
                            for(let j in classes) {
                                clas += `<li>${classes[j].level.title}</li>`
                            }
                            let temp = `
                            <tr class="staff-row">
                                <td>
                                <div class="w-bold-x">${e[i].examId}</div>
                                </td>
                                <td>${e[i].course.title}</td>
                                <td>${e[i].teacher?.firstName || `<i class="w-text-gray">Not Assigned</i>`} ${e[i].teacher?.lastName || ''}</td>
                                <td><ul style="padding-left:20px;">${clas}</ul></td>
                                <td>${e[i].term.title}</td>
                                <td class="w-center">${datify(e[i].date)}</td>
                                <td>${e[i].duration} minutes</td>
                                <td>
                                    ${e[i].active ? `
                                    <span class="success-btn">Active</span>` : `
                                    ${new Date(e[i].date) < new Date() ? `
                                    <span class="info-btn">Completed</span>` : `
                                    <span class="danger-btn">Upcoming</span>`}
                                    `}
                                </td>

                                <td class="w-center">
                                    <div class="dropdown">
                                        <i class="std-drop fa fa-ellipsis-v dropdown-toggle" data-toggle="dropdown"></i>
                                        <div class="dropdown-menu">
                                            <div class="dropdown-header">${e[i].course.title}</div>
                                            <a class="dropdown-item emp-que-link" data-id="${e[i].id}" href="#">
                                                <i class="fa fa-file-text"></i>&nbsp;View Questions
                                            </a>
                                            ${e[i].active ? `
                                                <a class="dropdown-item emp-act-link" data-id="${e[i].id}" data-action="deactivate" href="#">
                                                    <i class="fa fa-times-circle"></i>&nbsp;Deactivate
                                                </a>
                                                ` : `
                                                <a class="dropdown-item emp-act-link" data-id="${e[i].id}" data-action="activate" href="#">
                                                    <i class="fa fa-check-circle"></i>&nbsp;Activate
                                                </a>
                                            `}
                                            <a class="dropdown-item emp-std-link" data-id="${e[i].id}" href="#">
                                                <i class="fa fa-users"></i>&nbsp;View Students
                                            </a>
                                            <a class="dropdown-item emp-score-link" data-id="${e[i].id}" href="#">
                                                <i class="fa fa-list-alt"></i>&nbsp;View Scores
                                            </a>
                                            <a class="dropdown-item emp-det-link" data-id="${e[i].id}" href="#">
                                                <i class="fa fa-edit"></i>&nbsp;Edit Test
                                            </a>
                                            <a class="w-text-red w-hover-red dropdown-item emp-del-link" data-id="${e[i].id}" href="#">
                                                <i class="fa fa-trash"></i>&nbsp;Delete Test
                                            </a>
                                        
                                        </div>
                                    </div>
                                </td>
                          </tr>`;
                          $('.test-list').append(temp)
                        }
                        $('.emp-que-link').click(function(e) {
                            e.preventDefault();
                            let id = $(this).data('id');
                            $(".que-side-con").addClass("active")
                            getQuestions(id)
                        })
                        $('.emp-score-link').click(function(e) {
                            e.preventDefault();
                            let id = $(this).data('id');
                            //$(".score-side-con").addClass("active")
                            getScores(id)
                        })
                        $('.emp-std-link').click(function(e) {
                            e.preventDefault();
                            let id = $(this).data('id');
                            $(".score-side-con").addClass("active")
                            getExamStudents(id)
                        })
                        $('.emp-det-link').click(function(e) {
                            e.preventDefault();
                            let id = $(this).data('id');
                            getExam(id, "update")
                        })
                        $('.emp-del-link').click(function(e) {
                            e.preventDefault();
                            let id = $(this).data('id');
                            getExam(id, "delete");
                        })
                        $('.emp-act-link').click(function(e) {
                            e.preventDefault();
                            let id = $(this).data('id');
                            let action = $(this).data('action')
                            examStatus(id, action)
                        })
                    }
                    else {
                        let temp = `<tr>
                        <td colspan="8" class="w-text-gray w-italic">${data.message}</td>
                        </tr>`;
                        $('.test-list').append(temp)
                    }
                }
                else {
                    pushNotification("n_error", data.message, 3000);
                    let temp = `<tr>
                        <td colspan="8" class="w-text-gray w-italic">${data['message']}</td>
                        </tr>`;
                        $('.test-list').append(temp)
                }
        },
        onError: (error) => {
                console.error(error);
                $('.test-list').empty()
                pushNotification("n_network", "Error occurred. Kindly check your internet connection", 3000)
        }
  })
}


/* =========== Exam Section =============== */
function getExams() {
    let page = $('#emp_page').val();
    let pagesize = 20;
    let class_id = $("#class-filter").val();
    let subject_id = $("#sub-filter").val()
    let term_id = $("#term-filter").val()
    let exam_type = "exam";

    $('.exam-list').empty()
    loader = `<tr>
        <td colspan="6" class="">
        <i class="fa fa-spinner rotate"></i>&nbsp;&nbsp;&nbsp;Processing...
        </td>
    </tr>`;
    $('.exam-list').append(loader)

    let params = {page, pagesize, class_id, term_id, subject_id, exam_type}

    //console.log(params)

    admin.exam.getExams({
        params: params,
        onSuccess: (data) => {
                //console.log(data);
                $('.exam-list').empty()
                if(data.status == 'success') {
                    let pages = data.total_pages
                    //let count = data.total_count;
                    //$(".total_count").html(digify(count))
                    //$('.emp-no').html(data['total_items'])
                    $('#page_nos').empty();
                    for(var i=0; i<pages; i++) {
                        let classN = "";
                        if((i+1) == data.page_number) {
                            classN = "active"
                        }
                        if((i+1) > (data.page_number + 1) || (i+1) < (data.page_number - 1)) {
                            continue
                        }
                        var temp = `<a href="#" class="page_no ${classN}" data-id="${i+1}">${i+1}</a>`;
                        $('#page_nos').append(temp);
                    }
                    let current_p = $('#page_nos .page_no.active').data('id')
                    //console.log(current_p + ":" + typeof(current_p))
                    if((current_p - 1) > 0) {
                        let prev = `<a href="#" class="page_no" data-id="${current_p - 1}"><i class="fa fa-angle-left"></i></a>`
                        $('#page_nos').prepend(prev);
                    }
                    if((current_p + 1) <= data.total_pages) {
                        let next = `<a href="#" class="page_no" data-id="${current_p + 1}"><i class="fa fa-angle-right"></i></a>`
                        $('#page_nos').append(next);
                    }
                    $('#page_nos .page_no').click(function(e) {
                        e.preventDefault();
                        let page = $(this).data('id');
                        $('#emp_page').val(page);
                        getExams();
                    })
                    if(data.data) {
                        let e = data.data;
                        
                        for(var i in e) {
                            let classes = e[i].classrooms;
                            let clas = ``
                            for(let j in classes) {
                                clas += `<li>${classes[j].level.title}</li>`
                            }
                            let temp = `<tr class="staff-row">
                            <td>
                            <div class="w-bold-x">${e[i].examId}</div>
                            </td>
                            <td>${e[i].course.title}</td>
                            <td>${e[i].teacher?.firstName || `<i class="w-text-gray">Not Assigned</i>`} ${e[i].teacher?.lastName || ''}</td>
                            <td><ul style="padding-left:20px;">${clas}</ul></td>
                            <td>${e[i].term.title}</td>
                            <td class="w-center">${datify(e[i].date)}</td>
                            <td>${e[i].duration} minutes</td>
                            <td>
                                ${e[i].active ? `
                                <span class="success-btn">Active</span>` : `
                                ${new Date(e[i].date) < new Date() ? `
                                <span class="info-btn">Completed</span>` : `
                                <span class="danger-btn">Upcoming</span>`}
                                `}
                            </td>

                            <td class="w-center">
                                    <div class="dropdown">
                                        <i class="std-drop fa fa-ellipsis-v dropdown-toggle" data-toggle="dropdown"></i>
                                        <div class="dropdown-menu">
                                        <div class="dropdown-header">${e[i].course.title}</div>
                                            <a class="dropdown-item emp-que-link2" data-id="${e[i].id}" href="#">
                                                <i class="fa fa-file-text"></i>&nbsp;View Questions
                                            </a>
                                            ${e[i].active ? `
                                                <a class="dropdown-item emp-act-link2" data-id="${e[i].id}" data-action="deactivate" href="#">
                                                    <i class="fa fa-times-circle"></i>&nbsp;Deactivate
                                                </a>
                                                ` : `
                                                <a class="dropdown-item emp-act-link2" data-id="${e[i].id}" data-action="activate" href="#">
                                                    <i class="fa fa-check-circle"></i>&nbsp;Activate
                                                </a>
                                            `}
                                            <a class="dropdown-item emp-std-link2" data-id="${e[i].id}" href="#">
                                                <i class="fa fa-users"></i>&nbsp;View Students
                                            </a>
                                            <a class="dropdown-item emp-score-link2" data-id="${e[i].id}" href="#">
                                                <i class="fa fa-list-alt"></i>&nbsp;View Scores
                                            </a>
                                            <a class="dropdown-item emp-det-link2" data-id="${e[i].id}" href="#">
                                                <i class="fa fa-edit"></i>&nbsp;Edit Exam
                                            </a>
                                            <a class="w-text-red w-hover-red dropdown-item emp-del-link2" data-id="${e[i].id}" href="#">
                                                <i class="fa fa-trash"></i>&nbsp;Delete Exam
                                            </a>
                                        
                                        </div>
                                    </div>
                            </td>
                          </tr>`;
                          $('.exam-list').append(temp)
                        }
                        $('.emp-que-link2').click(function(e) {
                            e.preventDefault();
                            let id = $(this).data('id');
                            $(".que-side-con").addClass("active")
                            getQuestions(id)
                        })
                        $('.emp-score-link2').click(function(e) {
                            e.preventDefault();
                            let id = $(this).data('id');
                            //$(".score-side-con").addClass("active")
                            getScores(id)
                        })
                        $('.emp-std-link2').click(function(e) {
                            e.preventDefault();
                            let id = $(this).data('id');
                            $(".score-side-con").addClass("active")
                            getExamStudents(id)
                        })
                        $('.emp-det-link2').click(function(e) {
                            e.preventDefault();
                            let id = $(this).data('id');
                            getExam(id, "update")
                        })
                        $('.emp-del-link2').click(function(e) {
                            e.preventDefault();
                            let id = $(this).data('id');
                            getExam(id, "delete");
                        })
                        $('.emp-act-link2').click(function(e) {
                            e.preventDefault();
                            let id = $(this).data('id');
                            let action = $(this).data('action')
                            examStatus(id, action)
                        })
                    }
                    else {
                        let temp = `<tr>
                        <td colspan="8" class="w-text-gray w-italic">${data.message}</td>
                        </tr>`;
                        $('.exam-list').append(temp)
                    }
                }
                else {
                    pushNotification("n_error", data.message, 3000);
                    let temp = `<tr>
                        <td colspan="8" class="w-text-gray w-italic">${data['message']}</td>
                        </tr>`;
                        $('.exam-list').append(temp)
                }
        },
        onError: (error) => {
                console.error(error);
                $('.exam-list').empty()
                pushNotification("n_network", "Error occurred. Kindly check your internet connection", 3000)
        }
  })
}

function addExam() {
    let class_ids = $("input[name='class_ids']:checked").map(function() {
        return $(this).val();
      }).get();
    var term_id = $("#term-filter2").val();
    let subject_id = $("#sub-filter2").val();
    let date = $("#exam-date").val();
    let duration = $("#exam-duration").val();
    let exam_type = $("#exam-type").val();
    let percentage = $("#exam-percent").val();
    let staff_id = $("#ex-staff").val();

    if(!subject_id) {
        pushNotification("n_warning", "Kindly select a subject to continue", 3000);
        return;
    }
    if(class_ids.length === 0) {
        pushNotification("n_warning", "Kindly select at least one class to continue", 3000);
        return;
    }
    if(!term_id) {
        pushNotification("n_warning", "Kindly select a term to continue", 3000);
        return;
    }
    if(Number(percentage) < 1 || Number(percentage) > 100) {
        pushNotification("n_warning", "Percentage has to be between 1 and 100", 3000);
        return;
    }

    let formData = {class_ids, percentage, staff_id, term_id, subject_id, date, duration, exam_type}

    //console.log(formData)

    showLoader(`Adding ${capitalize(exam_type)}...`)

    admin.exam.addExam({
        formData: formData,
        onSuccess: (data) => {
            //console.log(data)
            if(data.status == "success") {
                pushNotification("n_success", data.message, 5000);
                $(".add-exam-form")[0].reset();
                //$(".add-cur-con").removeClass('active')
                getData();
                getTests();
                getExams();
                getResults();
            }
            else {
                pushNotification("n_error", data.message, 5000)
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

function examStatus(exam_id, action) {
    showLoader("Updating exam status...")
    admin.exam.updateExamStatus({
        formData: {exam_id, action},
            onSuccess: (data) => {
                if(data.status == 'success') {
                    pushNotification('n_success', data.message, 3000)
                }
                else {
                    pushNotification('n_error', data.message, 3000)
                }
                getExams()
                getTests()
                getData()
                hideLoader()
            },
            onError: (error) => {
                console.error(error)
                pushNotification("n_network", "Error occurred. Kindly check your internet connection", 3000)
                hideLoader()
            }
    })
}

function getExam(exam_id, action) {
    showLoader("Processing...")
    //console.log(subject_id)

    admin.exam.getExams({
        params: {exam_id},
        onSuccess: (data) => {
            //console.log(data)
            if(data.status == "success") {
                let d = data.data;
                $(".exam-id").val(d.id)
                $(".exam-name").html(`${d.term.title} ${d.course.title} ${capitalize(d.examType)} for ${d.classrooms.map(function(item) {
                    return item.level.title;
                  }).join(', ')}`)
                  $(".ex-type").html(capitalize(d.examType))
                $("#exam-date2").val(d.date)
                $("#ex-staff2").val(d.teacher?.id || "")
                $("#exam-duration2").val(d.duration)
                $(".exam-type2").val(d.examType);
                $("#exam-percent2").val(d.percentage)
                
                $(`.${action}-exam-con`).addClass("active")
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

function updateExam() {
    let exam_id = $(".exam-id").val();
    let date = $("#exam-date2").val();
    let duration = $("#exam-duration2").val();
    let exam_type = $(".exam-type2").val();
    let staff_id = $("#ex-staff2").val();
    let percentage = $("#exam-percent2").val();

    if(Number(percentage) < 1 || Number(percentage) > 100) {
        pushNotification("n_warning", "Percentage has to be between 1 and 100", 3000);
        return;
    }

    let formData = {exam_id, date, duration, staff_id, percentage};

    showLoader(`Updating ${capitalize(exam_type)}...`)

    admin.exam.updateExam({
        formData: formData,
        onSuccess: (data) => {
            //console.log(data)
            if(data.status == "success") {
                pushNotification("n_success", data.message, 5000);
                $(".update-exam-form")[0].reset();
                $(".update-exam-con").removeClass("active");
                getExams();
                getTests()
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

function deleteExam() {
    let exam_id = $(".exam-id").val();
    let password = $("#exam-delete-password").val();
    let exam_type = $(".exam-type2").val();

    let formData = {exam_id, password};

    showLoader(`Deleting ${capitalize(exam_type)}...`)

    admin.exam.deleteExam({
        formData: formData,
        onSuccess: (data) => {
            //console.log(data)
            if(data.status == "success") {
                pushNotification("n_success", data.message, 5000);
                $(".delete-exam-form")[0].reset();
                $(".delete-exam-con").removeClass("active");
                getData();
                getExams();
                getTests()
            }
            else {
                //checkResponse(data)
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

var global_mcq_questions = []

function getQuestions(exam_id) {
    $(".que-list").empty();
    let loader = `<tr>
        <td colspan="4" class="">
        <i class="fa fa-spinner rotate"></i>&nbsp;&nbsp;&nbsp;Processing...
        </td>
    </tr>`;
    global_mcq_questions.length = 0
    $(".que-list").append(loader)
    admin.exam.getExamQuestions({
        params: {exam_id},
            onSuccess: (data) => {
                $(".que-list").empty()
                //console.log(data)
                if(data.status == "success") {
                    let p = data.data;
                    global_mcq_questions = p.mcq_questions;
                    $(".exam-name").html(p.exam_title).data('id', p.exam_id)
                    $(".exam-typ").html(capitalize(p.exam_type))
                    if(p.mcq_questions.length > 0) {
                        let d = p.mcq_questions;
                        for(let i in d) {
                            
                            let temp = `
                            <tr class="" data-id="${d[i].number}">
                                <td>${d[i].number}</td>
                                <td style="max-width:300px;white-space:wrap;">${d[i].question}</td>
                                <td>
                                    <ol type="A" class="w-flex w-flex-wrap w-flex-start w-align-center" style="gap:25px;flex-wrap:wrap;">
                                        ${d[i].options.map(function(item) {
                                            return `<li>${item}</li>`;
                                        }).join('')}
                                    </ol>
                                </td>
                                <td style="max-width:250px;white-space:wrap;">${d[i].answer}</td>
              
                                <td class="w-center">
                                    <div class="dropdown">
                                        <i class="std-drop fa fa-ellipsis-v dropdown-toggle" data-toggle="dropdown"></i>
                                        <div class="dropdown-menu">
                                        <div class="dropdown-header">Question ${d[i].number}</div>
                                            <a class="dropdown-item que-det-link" data-id="${d[i].number}" href="#">
                                                <i class="fa fa-edit"></i>&nbsp;Edit Question
                                            </a>
                                            <a class="dropdown-item w-text-red w-hover-red que-del-link" data-id="${d[i].number}" href="#">
                                                <i class="fa fa-trash"></i>&nbsp;Delete Question
                                            </a>                                        
                                        </div>
                                    </div>
                            </td>
                            </tr>`;
                            $('.que-list').append(temp)
                        }
                    }
                    else {
                        let temp = `<tr>
                        <td colspan="5">
                        No questions added yet.
                        </td>
                        </tr>`;
                        $('.que-list').html(temp)
                    }
                    tinymce.get('que-essay').setContent(p.essay_questions)
                    $('.que-det-link').click(function(e) {
                        e.preventDefault();
                        let id = $(this).data('id');
                        getQuestion(id, "update")
                    })
                    $('.que-del-link').click(function(e) {
                        e.preventDefault();
                        let id = $(this).data('id');
                        getQuestion(id, "delete")
                    })

                }
                else {
                    let temp = `<tr>
                        <td colspan="5">
                        ${data.message} <span class="w-text-red" onclick="getQuestions(${exam_id})">click here </span>to try again
                        </td>
                    </tr>`;
                    $('.que-list').html(temp)
                }
            },
            onError: (error) => {
                console.error(error)
                let temp = `<tr>
                        <td colspan="5">
                        Error occurred.  Kindly check your internet connection and <span class="w-text-red" onclick="getQuestions(${exam_id})">click here </span>to try again
                        </td>
                    </tr>`;
                    $('.que-list').html(temp)
            }
    })
}

$(".add-opt-btn").on('click', function() {
    addOption('', updateOptions)
})

function updateOptions() {
    $("#que-ans").empty();
    $(".opt-opt").each((index, elem) => {
        let temp = `<option value="${$(elem).text()}">${$(elem).text()}</option>`;
        $("#que-ans").append(temp)
    })
}

function addQuestion() {
    let exam_id = $(".exam-name").data('id')
    let question = $("#que-que").val();

    let options = []
    $(".opt-opt").each((index, elem) => {
        options.push($(elem).text());
    })
    let answer = $("#que-ans").val()

    let formData = {exam_id, question, answer, options}

    //console.log(formData)
    showLoader("Adding Question...")

    admin.exam.addExamQuestion({
        formData: formData,
        onSuccess: (data) => {
            //console.log(data)
            if(data.status == "success") {
                pushNotification("n_success", data.message, 5000);
                $(".add-que-form")[0].reset();
                $(".opts-selected").empty()
                updateOptions()
                getQuestions(exam_id)
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

function generateQuestion() {
    let exam_id = $(".exam-name").data('id')
    let question_count = $("#que-count").val();
    let option_count = $("#opt-count").val();
    let prompt = $("#que-prompt").val();

    let formData = {exam_id, question_count, option_count, prompt}

    //console.log(formData)
    showLoader("Generating Questions...")

    admin.exam.generateExamQuestion({
        formData: formData,
        onSuccess: (data) => {
            //console.log(data)
            if(data.status == "success") {
                pushNotification("n_success", data.message, 5000);
                getQuestions(exam_id)
                $(".gen-que-form")[0].reset()
                $(".gen-que-con").removeClass('active')
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

function generateEssay() {
    let exam_id = $(".exam-name").data('id')
    let question_count = $("#que-count2").val();
    let prompt = $("#que-prompt2").val();

    let formData = {exam_id, question_count, prompt}

    //console.log(formData)
    showLoader("Generating Questions...")

    admin.exam.generateExamEssay({
        formData: formData,
        onSuccess: (data) => {
            console.log(data)
            if(data.status == "success") {
                pushNotification("n_success", data.message, 5000);
                //getQuestions(exam_id)
                $(".gen-essay-form")[0].reset()
                $(".gen-essay-con").removeClass('active')
                let d = data.data;
                let temp = `
                ${renderMarkdown(d.content)}
                `;
                tinymce.get('que-essay').setContent(temp)
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

function updateEssay() {
    let exam_id = $(".exam-name").data('id')
    let essay = tinymce.get('que-essay').getContent({format: 'html'})
    
    let formData = {exam_id, essay}

    //console.log(formData)
    showLoader("Updating Essay...")

    admin.exam.updateExamEssay({
        formData: formData,
        onSuccess: (data) => {
            //console.log(data)
            if(data.status == "success") {
                pushNotification("n_success", data.message, 5000);
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

function downloadExam() {
    let exam_id = $(".exam-name").data('id')

    showLoader("Generating PDF...")

    admin.exam.downloadExam({
        params: {exam_id},
        onSuccess: (data) => {
            //console.log(data)
            if(data.status == "success") {
                pushNotification("n_success", data.message, 5000);
                if(data.data) {
                    let file_splits = data.data.split('/');
                    let filename = file_splits[file_splits.length - 1]
                    downloadFile(data.data, filename)
                }
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

function updateOptions2() {
    $("#que-ans2").empty();
    $(".opt-opt2").each((index, elem) => {
        let temp = `<option value="${$(elem).text()}">${$(elem).text()}</option>`;
        $("#que-ans2").append(temp)
    })
}

$(".add-opt-btn2").on('click', function() {
    addOption('2', updateOptions2)
})
function addOption(t="", callback) {
    let option = $(`#que-opt${t}`).val()
    //option = escapeHtml(option)
    let temp = `
    <div class="opt-selected${t} light-btn">
        <span class="opt-opt${t}">${option}</span>
        <span class="opt-canc${t}">X</span>
    </div>`;
    $(`.opts-selected${t}`).append(temp)
    
    
    $(`#que-opt${t}`).val('');
    callback()

    $(`.opt-canc${t}`).on('click', function() {
        $(this).parent(`.opt-selected${t}`).remove()
        callback()
    })
}

function getQuestion(q_no, action) {
    showLoader("Processing...")

    $(".opts-selected2").empty();
    $("#que-ans2").empty();
    $(".update-que-form")[0].reset();

    // var que = $.grep(global_mcq_questions, function(q) {
    //     return q.number == q_no;
    // })[0];

    var que = global_mcq_questions.find(q => q.number == q_no)

    $(".q_nos").html(que.number);
    $(".q_no").val(que.number);

    if(action == "update") {
        $("#que-que2").val(que.question);

        que.options.map((elem) => {
            let temp = `<option value="${elem}">${elem}</option>`;

            let temp2 = `
                <div class="opt-selected2 light-btn">
                    <span class="opt-opt2">${elem}</span>
                    <span class="opt-canc2">X</span>
                </div>`;

            $(".opts-selected2").append(temp2)
            $("#que-ans2").append(temp)
        })

        $("#que-ans2").val(que.answer)

        $(".opt-canc2").on('click', function() {
            $(this).parent('.opt-selected2').remove()
            updateOptions2()
        })
    }
    
    
    $(`.${action}-que-con`).addClass("active")

    hideLoader()
            
}

function updateQuestion() {
    let exam_id = $(".exam-name").data('id')
    let question_number = $(".q_no").val()
    let question = $("#que-que2").val();

    let options = []
    $(".opt-opt2").each((index, elem) => {
        options.push($(elem).text());
    })
    let answer = $("#que-ans2").val()

    let formData = {exam_id, question, answer, options, question_number}

    //console.log(formData)
    showLoader(`Updating Question ${question_number}...`)

    admin.exam.updateExamQuestion({
        formData: formData,
        onSuccess: (data) => {
            //console.log(data)
            if(data.status == "success") {
                pushNotification("n_success", data.message, 5000);
                getQuestions(exam_id)
                $(".update-que-con").removeClass('active')
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

function deleteQuestion() {
    let exam_id = $(".exam-name").data('id')
    let question_number = $(".q_no").val()

    let formData = {exam_id, question_number}

    //console.log(formData)
    showLoader(`Delete Question ${question_number}...`)

    admin.exam.deleteExamQuestion({
        formData: formData,
        onSuccess: (data) => {
            //console.log(data)
            if(data.status == "success") {
                pushNotification("n_success", data.message, 5000);
                getQuestions(exam_id)
                $(".delete-que-con").removeClass('active')
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

$("#que-opt").on('keydown', function(e) {
    if(e.key === "Enter") {
        e.preventDefault();
        addOption('', updateOptions)
    }
})
$("#que-opt2").on('keydown', function(e) {
    if(e.key === "Enter") {
        e.preventDefault();
        addOption('2', updateOptions2)
    }
})

function getScores(exam_id) {
    $(".score-list").empty();
    let loader = `<tr>
        <td colspan="5" class="">
        <i class="fa fa-spinner rotate"></i>&nbsp;&nbsp;&nbsp;Processing...
        </td>
    </tr>`;

    $(".score-list").append(loader)
    $(".update-score-con").addClass("active")
    admin.exam.getExamScores({
        params: {exam_id},
            onSuccess: (data) => {
                $(".score-list").empty()
                //console.log(data)
                if(data.status == "success") {
                    let d = data.data;

                    $(".exam-name2").html(data.exam_title)
                    $(".exam-id2").val(data.exam_id)

                    for(let i in d) {
                        let temp = `
                            <tr class="">
                                <td> 
                                    <img class="w-circle" style="width:40px;height:40px;"
                                    src="${d[i].student.image ? `${base_url}${d[i].student.image}` : `/static/image/avatar.png`}" alt="" />
                                </td>
                                <td>${d[i].student.firstName} ${d[i].student.middleName} ${d[i].student.lastName}</td>
                                <td>${d[i].student.classroom.level.title}</td>
                                <td>
                                    <div class="input-con">
                                        <input type="number" name="score_values" 
                                        value="${d[i].score}" 
                                        data-id="${d[i].student.id}" 
                                        min="0" max="100"
                                        style="max-width:60px;"
                                     />
                                    </div>
                                </td>
                                <td class="w-text-gray h4">
                                    <a class="score-rep-link tooltipa" href="#" 
                                    data-name="${d[i].student.firstName} ${d[i].student.middleName} ${d[i].student.lastName}" 
                                    data-id='${JSON.stringify(d[i].report)}'>
                                        <i class="fa fa-eye"></i>&nbsp;&nbsp;&nbsp;
                                        <span class="tooltiptext w-card">View Exam Report</span>
                                    </a>
                                </td>
                            </tr>`;
                            $('.score-list').append(temp)
                    }
                    $('.score-rep-link').click(function(e) {
                        e.preventDefault();
                        let report = $(this).data('id');
                        let user = $(this).data('name');
                        showReport(report, user)
                    })
                }
                else {
                    let temp = `<tr>
                        <td colspan="5">
                        ${data.message} <span class="w-text-red" onclick="getQuestions(${exam_id})">click here </span>to try again
                        </td>
                    </tr>`;
                    $('.que-list').html(temp)
                }
            },
            onError: (error) => {
                console.error(error)
                let temp = `<tr>
                        <td colspan="5">
                        Error occurred.  Kindly check your internet connection and <span class="w-text-red" onclick="getScores(${exam_id})">click here </span>to try again
                        </td>
                    </tr>`;
                    $('.score-list').html(temp)
            }
    })
}

function updateScores() {
    let exam_id = $(".exam-id2").val()
    let scores = []

    $("input[name=score_values]").each((index, elem) => {
        let student_id = $(elem).data('id')
        let score = $(elem).val()
        scores.push({student_id, score})
    })

    let formData = {exam_id, scores}

    //console.log(formData)
    showLoader(`Updating Scores...`)

    admin.exam.updateExamScores({
        formData: formData,
        onSuccess: (data) => {
            //console.log(data)
            if(data.status == "success") {
                pushNotification("n_success", data.message, 5000);
                getScoreSheet();
                getResults();
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

function showReport(report, user) {
    report.sort((a, b) => parseInt(a.number) - parseInt(b.number))
    //console.log(report)
    $(".rep_std").html(user)
    $(".report-con").empty();
    for(let i in report) {
        let temp = `
        <div class="card">
              <div class="card-header">
                <a class="card-link" data-toggle="collapse" href="#collapse_${i}">
                ${report[i].comment == "correct" ? `
                    <i class="w-big fa fa-check w-text-green"></i>` : `
                    <i class="w-big fa fa-times w-text-red"></i>`}  
                &nbsp;&nbsp;Question ${report[i].number}
                </a>
              </div>
              <div id="collapse_${i}" class="collapse" data-parent="#accordion">
                  <div class="w-padding">
                    <b>Question: </b> ${report[i].question}<br><br>
                    <b>Answer: </b> ${report[i].answer}<br><br>
                    <b>Selected Answer: </b> ${report[i].selected_answer}
                  </div>
                </div>
              </div>
            </div>`;
        $(".report-con").append(temp)
    }
    $(".score-report-con").addClass("active")
}

function getExamStudents(exam_id) {
    $(".std-list").empty();
    let loader = `<tr>
        <td colspan="4" class="">
        <i class="fa fa-spinner rotate"></i>&nbsp;&nbsp;&nbsp;Processing...
        </td>
    </tr>`;

    $(".std-list").append(loader)
    $(".update-std-con").addClass("active")
    admin.exam.getExamStudents({
        params: {exam_id},
            onSuccess: (data) => {
                $(".std-list").empty()
                //console.log(data)
                if(data.status == "success") {
                    let d = data.data;

                    $(".exam-name2").html(data.exam_title)
                    $(".exam-id3").val(data.exam_id)

                    for(let i in d) {
                        let temp = `
                            <tr>
                                <td style="max-width:30px !important;">
                                    <label class="checkbox-con">
                                        <input type="checkbox" name="exam_std_ids" value="${d[i].id}" ${d[i].is_active ? `checked` : ``}>
                                        <span class="checkmark"></span>
                                    </label>
                                </td>
                                <td> 
                                    <img class="w-circle" style="width:40px;height:40px;"
                                    src="${d[i].image ? `${base_url}${d[i].image}` : `/static/image/avatar.png`}" alt="" />
                                </td>
                                <td>${d[i].name}</td>
                                <td>${d[i].student_id}</td>
                                <td>${d[i].classroom}</td>
                            </tr>`;
                            $('.std-list').append(temp)
                    }
                }
                else {
                    let temp = `<tr>
                        <td colspan="4">
                        ${data.message} <span class="w-text-red" onclick="getExamStudents(${exam_id})">click here </span>to try again
                        </td>
                    </tr>`;
                    $('.std-list').html(temp)
                }
            },
            onError: (error) => {
                console.error(error)
                let temp = `<tr>
                        <td colspan="4">
                        Error occurred.  Kindly check your internet connection and <span class="w-text-red" onclick="getExamStudents(${exam_id})">click here </span>to try again
                        </td>
                    </tr>`;
                    $('.std-list').html(temp)
            }
    })
}

function updateExamStudents() {
    let exam_id = $(".exam-id3").val()
    let students_data = []
    $("input[name='exam_std_ids']").map(function() {
        let std_data = {
            id: $(this).val(),
            is_active: $(this).is(':checked')
        }
        students_data.push(std_data);
    });
    //console.log(students_data)
    if(students_data.length == 0) {
        pushNotification("n_warning", "No student has been selected", 5000);
        return;
    }

    let formData = {exam_id, students_data}

    //console.log(formData)
    showLoader(`Updating data...`)

    admin.exam.updateExamStudents({
        formData: formData,
        onSuccess: (data) => {
            //console.log(data)
            if(data.status == "success") {
                pushNotification("n_success", data.message, 5000);
                //getResults()
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

/* =========== Result Section =============== */
function getResults() {
    let page = $('#emp_page2').val();
    let pagesize = 20;
    let class_id = $("#class-filter1").val();
    let term_id = $("#term-filter1").val()
    //let search = $('#emp_search3').val();

    $('.result-list').empty()
    loader = `<tr>
        <td colspan="6" class="">
        <i class="fa fa-spinner rotate"></i>&nbsp;&nbsp;&nbsp;Processing...
        </td>
    </tr>`;
    $('.result-list').append(loader)

    let params = {page, pagesize, class_id, term_id}

    //console.log(params)

    admin.result.getResults({
        params: params,
        onSuccess: (data) => {
                //console.log(data);
                $('.result-list').empty()
                if(data.status == 'success') {
                    let pages = data.total_pages
                    //let count = data.total_count;
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
                        $('#emp_page2').val(page);
                        getResults();
                    })
                    if(data.data) {
                        let d = data.data;
                        
                        for(var i in d) {
                            let temp = `<tr class="staff-row">
                            <td> 
                                <img class="w-circle" style="width:40px;height:40px;"
                                src="${d[i].student.image ? `${base_url}${d[i].student.image}` : `/static/image/avatar.png`}" alt="" />
                            </td>
                            <td>${d[i].student.firstName} ${d[i].student.middleName} ${d[i].student.lastName}</td>
                            <td>${d[i].classroom.level.title}</td>
                            <td class="w-center">${digify(d[i].average_score)}</td>
                            <td class="w-center">${d[i].grade}</td>
                            <td class="w-center">${d[i].position || 'N/A'}</td>

                            <td class="w-center">
                                    <div class="dropdown">
                                        <i class="std-drop fa fa-ellipsis-v dropdown-toggle" data-toggle="dropdown"></i>
                                        <div class="dropdown-menu">
                                        <div class="dropdown-header">${d[i].student.firstName} ${d[i].student.middleName} ${d[i].student.lastName}</div>
                                            <a class="dropdown-item emp-view-link" data-id="${d[i].id}" href="#">
                                                <i class="fa fa-file-text"></i>&nbsp;View Result
                                            </a>
                                            ${d[i].file ? `
                                                <a class="dropdown-item emp-download-link" data-id="${d[i].file}" href="#">
                                                    <i class="fa fa-file-pdf-o"></i>&nbsp;Download Result
                                                </a>
                                                ` : ``
                                            }
                                        
                                        </div>
                                    </div>
                            </td>
                          </tr>`;
                          $('.result-list').append(temp)
                        }
                        $('.emp-view-link').click(function(e) {
                            e.preventDefault();
                            let id = $(this).data('id');
                            viewResult({type: "single", doc_id: id})
                        })
                        $('.emp-download-link').click(function(e) {
                            e.preventDefault();
                            let id = $(this).data('id');
                            let url = `${base_url}${id}`
                            downloadFile(url)
                        })
                    }
                    else {
                        let temp = `<tr>
                        <td colspan="6" class="w-text-gray w-italic">${data.message}</td>
                        </tr>`;
                        $('.result-list').append(temp)
                    }
                }
                else {
                    pushNotification("n_error", data.message, 3000);
                    let temp = `<tr>
                        <td colspan="6" class="w-text-gray w-italic">${data['message']}</td>
                        </tr>`;
                        $('.result-list').append(temp)
                }
        },
        onError: (error) => {
                console.error(error);
                $('.result-list').empty()
                pushNotification("n_network", "Error occurred. Kindly check your internet connection", 3000)
        }
  })
}

function viewResult(obj) {
    let url = buildQueryParams(obj, '/results', '')
    window.open(url, '_blank')
}

function downloadClassResult(class_id, term_id) {
    //let obj = {type: "bulk", class_id, term_id}
    //let url = buildQueryParams(obj, '/results', '')

    let formData = {class_id, term_id}

    //console.log(formData)
    showLoader(`Generating PDF...`)

    admin.result.classResultPDF({
        formData: formData,
        onSuccess: (data) => {
            //console.log(data)
            if(data.status == "success") {
                pushNotification("n_success", data.message, 5000);
                downloadFile(data.data)
                getResults()
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

function generateClassResult(class_id, term_id) {
    let formData = {class_id, term_id}

    //console.log(formData)
    showLoader(`Generating Results PDF...`)

    admin.result.studentResultPDF({
        formData: formData,
        onSuccess: (data) => {
            //console.log(data)
            if(data.status == "success") {
                pushNotification("n_success", data.message, 5000);
            }
            else {
                pushNotification("n_error", data.message, 3000)
            }
            getResults()
            hideLoader()
        },
        onError: (error) => {
            console.error(error);
            pushNotification("n_network", "Error occurred. Kindly check your internet connection", 3000)
            hideLoader()
        }
    })
}

function resultActions() {
    let action = $("#result-action").val();
    if(!action) {
        pushNotification('n_warning', 'Kindly select an action to proceed', 3000);
        return
    }
    let class_id = $("#class-filter1").val();
    let term_id = $("#term-filter1").val();
    if(!class_id) {
        pushNotification('n_warning', 'Kindly select a class from the menu to proceed', 3000);
        return
    }
    if(!term_id) {
        pushNotification('n_warning', 'Kindly select an academic term from the menu to proceed', 3000);
        return
    }
    switch(action) {
        case "view":
            var isconfirm = confirm("This will display the report sheet of each student in the selected classroom for the selected term. Do you want to proceed?")
            if(isconfirm === false) {
                return;
            }
            viewResult({type: "bulk", class_id, term_id})
            break;
        case "single":
            var isconfirm = confirm("This will generate a downloadable report sheet PDF for each student in the selected classroom for the selected term. Do you want to proceed?")
            if(isconfirm === false) {
                return;
            }
            generateClassResult(class_id, term_id)
            break;
        case "bulk":
            var isconfirm = confirm("This will generate a single downloadable PDF file containing the report sheet for each student in the selected classroom for the selected term. Do you want to proceed?")
            if(isconfirm === false) {
                return;
            }
            downloadClassResult(class_id, term_id)
            break
    }
    
}

function spreadsheetActions() {
    let session_id = $("#session-filter").val();
    let action = $(".spread-act").data('action');

    if(action === "view") {
        let obj = {session_id};
        let url = buildQueryParams(obj, '/spreadsheet', '')
        window.open(url, '_blank')
    }
    else if(action === "generate") {
        let formData = {session_id}

        showLoader(`Generating Spreadsheet...`)

        admin.result.generateSpreadsheet({
            formData: formData,
            onSuccess: (data) => {
                //console.log(data)
                if(data.status == "success") {
                    pushNotification("n_success", data.message, 5000);
                    downloadFile(data.data)
                }
                else {
                    pushNotification("n_error", data.message, 3000)
                }
                getResults()
                hideLoader()
            },
            onError: (error) => {
                //console.error(error);
                pushNotification("n_network", "Error occurred. Kindly check your internet connection", 3000)
                hideLoader()
            }
        })
    }
}


initiateTiny()
// tinymce.get('blog-post').getContent({format: 'html'})
// tinymce.get('blog-post2').setContent(p.about)


// ========== Event Listeners ======================
$(".add-exam-btn").click(function(e) {
    e.preventDefault();
    let typ = $(this).data('action');
    $(".ex-type").html(typ == "exam" ? "Exam" : "Test")
    $("#exam-type").val(typ)
    $(".add-exam-con").addClass('active')
})
$(".exam-export-btn").click(function(e) {e.preventDefault();})
$(".add-que-btn").click(function(e) {e.preventDefault();$(".add-que-con").addClass('active')})
$(".que-export-btn").click(function(e) {e.preventDefault();downloadExam()})
$(".spread-btn").click(function(e) {
    e.preventDefault();
    let act = $(this).data('action')
    $(".spread-act").html(act).data('action', act);
    $(".spread-con").addClass("active")
})

$(".gen-que-btn").click(function(e) {e.preventDefault();$(".gen-que-con").addClass('active')})
$(".gen-essay-btn").click(function(e) {e.preventDefault();$(".gen-essay-con").addClass('active')})

$(".sco-fil").on('change', function() {getScoreSheet()})

$("#emp_search").on('input', function() {
    let val = $(this).val();
    $(".score-row").each((index, elem) => {
        let std_n = $(elem).data('name');
        if(std_n.includes(val)) {
          $(elem).show();
        }
        else {
          $(elem).hide()
        }
    })
})

$(".add-exam-form").on('submit', function(e) {e.preventDefault();addExam()})
$(".update-exam-form").on('submit', function(e) {e.preventDefault();updateExam()})
$(".delete-exam-form").on('submit', function(e) {e.preventDefault();deleteExam()})
$(".add-que-form").on('submit', function(e) {e.preventDefault();addQuestion()})
$(".gen-que-form").on('submit', function(e) {e.preventDefault();generateQuestion()})
$(".gen-essay-form").on('submit', function(e) {e.preventDefault();generateEssay()})
$(".update-essay-form").on('submit', function(e) {e.preventDefault();updateEssay()})
$(".update-que-form").on('submit', function(e) {e.preventDefault();updateQuestion()})
$(".delete-que-form").on('submit', function(e) {e.preventDefault();deleteQuestion()})
$(".update-std-form").on('submit', function(e) {e.preventDefault();updateExamStudents()})
$(".update-score-form").on('submit', function(e) {e.preventDefault();updateScores()})
$(".result-act-form").on('submit', function(e) {e.preventDefault();resultActions()})
$(".spread-form").on('submit', function(e) {e.preventDefault();spreadsheetActions()})

