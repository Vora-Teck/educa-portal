/* =========== Transaction Section =============== */
showLoader("Loading data...")

function getNotifications() {
    let page = $('#emp_page').val();
    let pagesize = 15;

    $('.event-list').empty()
    loader = `<tr>
        <td colspan="2" class="">
        <i class="fa fa-spinner rotate"></i>&nbsp;&nbsp;&nbsp;Processing...
        </td>
    </tr>`;
    $('.note-list').append(loader)

    let params = {page, pagesize}

    //console.log(params)

    admin.memo.notifications({
        params: params,
        onSuccess: (data) => {
                //console.log(data);
                $('.note-list').empty()
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
                        getNotifications();
                    })
                    if(data.data) {
                        let e = data.data;
                        let note_type = {
                            tuition: "fa-graduation-cap info-btn",
                            subscription: "fa-repeat warning-btn",
                            transfer: "fa-bank info-btn",
                            funding: "fa-dollar info-btn",
                            verification: "fa-shield success-btn",
                            approval: "fa-check-circle success-btn",
                            payment: "fa-money warning-btn"
                        }
                        for(var i in e) {
                            let temp = `<tr class="staff-row ev-det-link" data-id='${JSON.stringify(e[i])}'>
                            <td style="max-width:500px;white-space:wrap;">
                            <div class="w-flex w-flex-start w-align-center" style="gap:10px;">
                                <div class="h4 fa ${note_type[e[i].details.type]}"></div>
                                <div>
                                    <div class="w-bold-x" style="color:var(--primary-color);">${e[i].title}</div>
                                    <div>${e[i].details.message}</div>
                                </div>
                            </div>
                            </td>
                            <td>${datify(e[i].date, true)}</td>
                          </tr>`;
                          $('.note-list').append(temp)
                        }
                        $('.ev-det-link').click(function(e) {
                            e.preventDefault();
                            let obj = $(this).data('id');
                            getNotification(obj)
                        })
                    }
                    else {
                        let temp = `<tr>
                        <td colspan="2" class="w-text-gray w-italic">${data.message}</td>
                        </tr>`;
                        $('.note-list').append(temp)
                    }
                }
                else {
                    pushNotification("n_error", data.message, 3000);
                    let temp = `<tr>
                        <td colspan="2" class="w-text-gray w-italic">${data['message']}</td>
                        </tr>`;
                        $('.note-list').append(temp)
                }
                hideLoader()
        },
        onError: (error) => {
                console.error(error);
                $('.note-list').empty()
                hideLoader()
                pushNotification("n_network", "Error occurred. Kindly check your internet connection", 3000)
        }
  })
}
getNotifications()


function getNotification(obj) {
    //console.log(obj)
    $(".note-table").empty()
    $("#note-title").html(obj.title)
    $("#note-date").html(datify(obj.date, true))

    for(let i in obj.details) {
        let temp = `
        <tr>
            <td class="w-bold">${capitalize(deslugify(i))}</td>
            <td>${obj.details[i]}</td>
        </tr>`
        $(".note-table").append(temp)
    }

    $(`.note-info-con`).addClass("active")
}


// ========== Event Listeners ======================
$(".add-memo-btn").click(function(e) {e.preventDefault();$(".add-memo-con").addClass('active')})

$(".add-memo-form").on('submit', function(e) {e.preventDefault();addMemo()})
$(".update-memo-form").on('submit', function(e) {e.preventDefault();updateMemo()})
$(".delete-memo-form").on('submit', function(e) {e.preventDefault();deleteMemo()})
$(".broadcast-memo-form").on('submit', function(e) {e.preventDefault();broadcastMemo()})

