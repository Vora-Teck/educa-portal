/* =========== Transaction Section =============== */
async function getTransactions() {
    let page = $('#emp_page').val();
    let pagesize = 20;
    let search = $('#emp_search').val();
    let status = $("#status-filter").val();
    let type = $("#type-filter").val();

    $('.trans-list').empty()
    loader = `<tr>
        <td colspan="6" class="">
        <i class="fa fa-spinner rotate"></i>&nbsp;&nbsp;&nbsp;Processing...
        </td>
    </tr>`;
    $('.trans-list').append(loader)

    let params = {page, pagesize, search, status, type}

    try {
        let data = await cache.fetchOrCache({
        func: "admin.transaction.getTransactions",
        params, fetcher: admin.transaction.getTransactions,
        ttl: 20 * 60 * 1000
        })

        $('.trans-list').empty()
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
                        getTransactions();
                    })
                    if(data.data) {
                        let e = data.data;

                        let stat_f = {
                            success: "success-btn", pending: "info-btn",
                            failed: "danger-btn", reversed: "warning-btn"
                        }

                        for(var i in e) {
                            let temp = `<tr class="staff-row">
                            <td class="w-bold-x">${e[i].reference}</td>
                            <td>${e[i].transaction_type}</td>
                            <td>&#8358;${digify(e[i].amount)}</td>
                            <td class="w-center">
                                <span class="${stat_f[e[i].status]}">${e[i].status}</span>
                            </td>
                            <td>${datify(e[i].date, true)}</td>
                            
                            <td class="w-center">
                                    <div class="dropdown">
                                        <i class="std-drop fa fa-ellipsis-v dropdown-toggle" data-toggle="dropdown"></i>
                                        <div class="dropdown-menu">
                                        <div class="dropdown-header">Ref: ${e[i].reference}</div>
                                            <a class="dropdown-item t-det-link" data-id='${JSON.stringify(e[i])}' href="#">
                                                <i class="fa fa-eye"></i>&nbsp;View Details
                                            </a>
                                            <a class="dropdown-item t-rec-link" data-id='${e[i].reference}' href="#">
                                                <i class="fa fa-file-pdf-o"></i>&nbsp;Generate Receipt
                                            </a>                                        
                                        </div>
                                    </div>
                            </td>
                          </tr>`;
                          $('.trans-list').append(temp)
                        }
                        $('.t-det-link').click(function(e) {
                            e.preventDefault();
                            let obj = $(this).data('id');
                            getTransaction(obj)
                        })
                        $('.t-rec-link').click(function(e) {
                            e.preventDefault();
                            let ref = $(this).data('id');
                            generateReceipt(ref)
                        })
                    }
                    else {
                        let temp = `<tr>
                        <td colspan="6" class="w-text-gray w-italic">${data.message}</td>
                        </tr>`;
                        $('.trans-list').append(temp)
                    }
                }
                else {
                    pushNotification("n_error", data.message, 3000);
                    let temp = `<tr>
                        <td colspan="6" class="w-text-gray w-italic">${data['message']}</td>
                        </tr>`;
                        $('.trans-list').append(temp)
                }
    }
    catch(error) {
        console.error(error);
        $('.trans-list').empty()
        pushNotification("n_network", "Error occurred. Kindly check your internet connection", 3000)
    }
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

getTransactions()

var delayedSearch = debounce(getTransactions, 500)



function getTransaction(obj) {
    //console.log(obj)
    let stat_f = {
        success: "success-btn", pending: "info-btn",
        failed: "danger-btn", reversed: "warning-btn"
    }
    $(".trans-id").val(obj.reference);
    $(".trans-amt").html(`&#8358;${digify(obj.amount, true)}`)
    $(".trans-stat").html(`<span class="${stat_f[obj.status]}">${obj.status}</span>`)
    $(".trans-type").html(obj.transaction_type);
    $(".trans-des").html(obj.description);
    $(".trans-ref").html(obj.reference);
    $(".trans-date").html(datify(obj.date, true));

    $(".trans-info-tab").empty();
    let det = obj.details
    for(let i in det) {
        let temp = `
        <tr>
            <td>${deslugify(i)}</td>
            <td>${det[i]}</td>
        </tr>`
        $(".trans-info-tab").append(temp);
    }

    $(`.view-trans-con`).addClass("active")
}


function generateReceipt(reference, type="transaction") {
    showLoader("Generating Receipt...")

    admin.transaction.generateReceipt({
        params: {reference, type},
        onSuccess: (data) => {
            //console.log(data)
            if(data.status == "success") {
                pushNotification("n_success", data.message, 5000);
                downloadFile(data.data)
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

/* =========== Subscriptions Section =============== */
async function getSubscriptions() {
    let page = $('#emp_page2').val();
    let pagesize = 20;
    let search = $('#emp_search2').val();
    let status = $("#status-filter2").val();

    $('.sub-list').empty()
    loader = `<tr>
        <td colspan="8" class="">
        <i class="fa fa-spinner rotate"></i>&nbsp;&nbsp;&nbsp;Processing...
        </td>
    </tr>`;
    $('.sub-list').append(loader)

    let params = {page, pagesize, search, status}

    try {
        let data = await cache.fetchOrCache({
        func: "admin.subscription.subscriptionHistory",
        params, fetcher: admin.subscription.subscriptionHistory
        })

        $('.sub-list').empty()
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
                    let current_p = $('#page_nos .page_no.active').data('id')
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
                        getSubscriptions();
                    })
                    if(data.data) {
                        let e = data.data;

                        let stat_f = {
                            success: "success-btn", pending: "info-btn",
                            failed: "danger-btn", reversed: "warning-btn"
                        }

                        for(var i in e) {
                            let temp = `<tr class="staff-row">
                            <td class="w-bold-x">${e[i].reference}</td>
                            <td>${e[i].plan.title}</td>
                            <td class="w-center">&#8358;${digify(e[i].amount)}</td>
                            <td>${e[i].duration}</td>
                            <td class="w-center">
                                <span class="${stat_f[e[i].status]}">${e[i].status}</span>
                            </td>
                            <td>${datify(e[i].date)}</td>
                            <td>${datify(e[i].expiry_date)}</td>
                            <td class="w-center">
                                    <div class="dropdown">
                                        <i class="std-drop fa fa-ellipsis-v dropdown-toggle" data-toggle="dropdown"></i>
                                        <div class="dropdown-menu">
                                        <div class="dropdown-header">Ref: ${e[i].reference}</div>
                                            <a class="dropdown-item s-det-link" data-id='${JSON.stringify(e[i])}' href="#">
                                                <i class="fa fa-eye"></i>&nbsp;View Details
                                            </a>
                                            <a class="dropdown-item s-rec-link" data-id='${e[i].reference}' href="#">
                                                <i class="fa fa-file-pdf-o"></i>&nbsp;Generate Receipt
                                            </a>                                        
                                        </div>
                                    </div>
                            </td>
                          </tr>`;
                          $('.sub-list').append(temp)
                        }
                        $('.s-det-link').click(function(e) {
                            e.preventDefault();
                            let obj = $(this).data('id');
                            getSubscription(obj)
                        })
                        $('.s-rec-link').click(function(e) {
                            e.preventDefault();
                            let ref = $(this).data('id');
                            generateReceipt(ref, "subscription")
                        })
                    }
                    else {
                        let temp = `<tr>
                        <td colspan="8" class="w-text-gray w-italic">${data.message}</td>
                        </tr>`;
                        $('.sub-list').append(temp)
                    }
                }
                else {
                    pushNotification("n_error", data.message, 3000);
                    let temp = `<tr>
                        <td colspan="8" class="w-text-gray w-italic">${data['message']}</td>
                        </tr>`;
                        $('.sub-list').append(temp)
                }
    }
    catch(error) {
        console.error(error);
        $('.sub-list').empty()
        pushNotification("n_network", "Error occurred. Kindly check your internet connection", 3000)
    }
}

//getSubscriptions()
var delayedSearch2 = debounce(getSubscriptions, 500)

function getSubscription(obj) {
    //console.log(obj)
    let stat_f = {
        success: "success-btn", pending: "info-btn",
        failed: "danger-btn", reversed: "warning-btn"
    }
    $(".sub-id").val(obj.reference);
    $(".trans-amt").html(`&#8358;${digify(obj.amount, true)}`)
    $(".trans-stat").html(`<span class="${stat_f[obj.status]}">${obj.status}</span>`)
    $(".sub-plan").html(`${obj.plan.title} Plan`);
    $(".sub-duration").html(obj.duration);
    $(".sub-ref").html(obj.reference);
    $(".sub-sdate").html(datify(obj.date));
    $(".sub-edate").html(datify(obj.expiry_date));
    $(".sub-date").html(datify(obj.created, true));

    $(`.view-sub-con`).addClass("active")
}


// ========== Event Listeners ======================
$(".export-trans-btn").click(function(e) {e.preventDefault();$(".export-trans-con").addClass('active')})
$(".export-sub-btn").click(function(e) {e.preventDefault();$(".export-sub-con").addClass('active')})


$(".view-trans-form").on('submit', function(e) {
    e.preventDefault();
    let ref = $(".trans-id").val();
    generateReceipt(ref)
})

$(".view-sub-form").on('submit', function(e) {
    e.preventDefault();
    let ref = $(".sub-id").val();
    generateReceipt(ref, "subscription")
})

