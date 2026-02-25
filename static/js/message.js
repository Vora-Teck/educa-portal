/* =========== Transaction Section =============== */
showLoader("Loading data...")

function getMemos() {
    let page = $('#emp_page').val();
    let pagesize = 10;
    let search = $('#emp_search').val();

    $('.event-list').empty()
    loader = `<tr>
        <td colspan="4" class="">
        <i class="fa fa-spinner rotate"></i>&nbsp;&nbsp;&nbsp;Processing...
        </td>
    </tr>`;
    $('.event-list').append(loader)

    let params = {page, pagesize, search}

    //console.log(params)

    admin.memo.memoList({
        params: params,
        onSuccess: (data) => {
                //console.log(data);
                $('.event-list').empty()
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
                        getMemos();
                    })
                    if(data.data) {
                        let e = data.data;
                        for(var i in e) {
                            let temp = `<tr class="staff-row">
                            <td>
                            <div class="w-bold-x">${e[i].subject}</div>
                            </td>
                            <td style="max-width:300px;white-space:wrap;">${e[i].message}</td>
                            <td>${datify(e[i].date, true)}</td>
                            <td class="w-center">
                                    <div class="dropdown">
                                        <i class="std-drop fa fa-ellipsis-v dropdown-toggle" data-toggle="dropdown"></i>
                                        <div class="dropdown-menu">
                                            <a class="dropdown-item ev-broad-link" data-id='${JSON.stringify(e[i])}' href="#">
                                                <i class="fa fa-bullhorn"></i>&nbsp;
                                                ${e[i].broadcasted === true ? `Rebroadcast` : `Broadcast`} Memo
                                            </a>
                                            <a class="dropdown-item ev-det-link" data-id='${JSON.stringify(e[i])}' href="#">
                                                <i class="fa fa-edit"></i>&nbsp;Update Memo
                                            </a>
                                            <a class="dropdown-item w-text-red w-hover-red ev-del-link" data-id='${JSON.stringify(e[i])}' href="#">
                                                <i class="fa fa-trash"></i>&nbsp;Delete Memo
                                            </a>                                        
                                        </div>
                                    </div>
                            </td>
                          </tr>`;
                          $('.event-list').append(temp)
                        }
                        $('.ev-del-link').click(function(e) {
                            e.preventDefault();
                            let obj = $(this).data('id');
                            getMemo(obj, "delete")
                        })
                        $('.ev-det-link').click(function(e) {
                            e.preventDefault();
                            let obj = $(this).data('id');
                            getMemo(obj, "update")
                        })
                        $('.ev-broad-link').click(function(e) {
                            e.preventDefault();
                            let obj = $(this).data('id');
                            getMemo(obj, "broadcast")
                        })
                    }
                    else {
                        let temp = `<tr>
                        <td colspan="4" class="w-text-gray w-italic">${data.message}</td>
                        </tr>`;
                        $('.event-list').append(temp)
                    }
                }
                else {
                    pushNotification("n_error", data.message, 3000);
                    let temp = `<tr>
                        <td colspan="4" class="w-text-gray w-italic">${data['message']}</td>
                        </tr>`;
                        $('.event-list').append(temp)
                }
                hideLoader()
        },
        onError: (error) => {
                console.error(error);
                $('.event-list').empty()
                hideLoader()
                pushNotification("n_network", "Error occurred. Kindly check your internet connection", 3000)
        }
  })
}
getMemos()

function debounce(func, delay) {
    let timeout;
    return(...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        func(...args);
      }, delay);
    }
}

var delayedSearch = debounce(getMemos, 500)


function addMemo() {
    let subject = $("#memo-subject").val();
    let message = $("#memo-message").val();


    let formData = {subject, message}

    //console.log(formData)

    showLoader("Creating New Memo...")

    admin.memo.createMemo({
        formData: formData,
        onSuccess: (data) => {
            //console.log(data)
            if(data.status == "success") {
                pushNotification("n_success", data.message, 5000);
                $(".add-memo-form")[0].reset();
                $(".add-memo-con").removeClass('active')
                getMemos()
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

function getMemo(obj, action) {
    //console.log(obj)
    $(".memo-name").html(`${obj.subject}`);
    $(".memo-id").val(obj.id);
    if(action == "update") {
        $("#memo-subject2").val(obj.subject);
        $("#memo-message2").val(obj.message);
    }
    $(`.${action}-memo-con`).addClass("active")
}

function updateMemo() {
    let memo_id = $(".memo-id").val();
    let subject = $("#memo-subject2").val();
    let message = $("#memo-message2").val();

    let formData = {memo_id, subject, message}

    showLoader("Updating Memo...")

    admin.memo.updateMemo({
        formData: formData,
        onSuccess: (data) => {
            //console.log(data)
            if(data.status == "success") {
                pushNotification("n_success", data.message, 5000);
                $(".update-memo-form")[0].reset();
                $(".update-memo-con").removeClass('active')
                getMemos()
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

function deleteMemo() {
    let memo_id = $(".memo-id").val();

    let formData = {memo_id}

    showLoader("Deleting Memo...")

    admin.memo.deleteMemo({
        formData: formData,
        onSuccess: (data) => {
            //console.log(data)
            if(data.status == "success") {
                pushNotification("n_success", data.message, 5000);
                $(".delete-memo-form")[0].reset();
                $(".delete-memo-con").removeClass('active')
                getMemos()
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

function broadcastMemo() {
    let memo_id = $(".memo-id").val();

    let audience = $("input[name='event-audience']:checked").map(function() {
        return $(this).val();
    }).get();
    
    let media = $("input[name='event-media']:checked").map(function() {
        return $(this).val();
    }).get();

    let formData = {memo_id, audience, media}

    //console.log(formData)

    showLoader("Broadcasting Memo...")

    admin.memo.broadcastMemo({
        formData: formData,
        onSuccess: (data) => {
            //console.log(data)
            if(data.status == "success") {
                pushNotification("n_success", data.message, 5000);
                $(".broadcast-memo-form")[0].reset();
                $(".broadcast-memo-con").removeClass('active')
                getMemos()
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


// ========== Event Listeners ======================
$(".add-memo-btn").click(function(e) {e.preventDefault();$(".add-memo-con").addClass('active')})

$(".add-memo-form").on('submit', function(e) {e.preventDefault();addMemo()})
$(".update-memo-form").on('submit', function(e) {e.preventDefault();updateMemo()})
$(".delete-memo-form").on('submit', function(e) {e.preventDefault();deleteMemo()})
$(".broadcast-memo-form").on('submit', function(e) {e.preventDefault();broadcastMemo()})

