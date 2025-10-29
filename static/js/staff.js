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
                console.log(data);
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
                            let temp = `<tr>
                            <td>
                            <div class="w-bold-xx emp-det-link" data-id="${e[i].id}">${e[i].staffId}</div>
                            </td>
                            <td>${e[i].firstName} ${e[i].lastName}</td>
                            <td>${e[i].gender[0].toUpperCase()}</td>
                            <td>${e[i].role}</td>
                            <td>-</td>
                            <td>${e[i].is_active ? `
                                <span class="w-text-green">Active</span>` : `
                                <span class="w-text-red">Inactive</span>`}</td>
                            <td class="w-text-gray h5">
                                <i class="fa fa-eye"></i>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                <i class="fa fa-trash"></i>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                <i class="fa fa-credit-card"></i>
                            </td>
                          </tr>`;
                          $('.staff-list').append(temp)
                        }
                        $('.emp-det-link').click(function(e) {
                            e.preventDefault();
                            let id = $(this).data('id');
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
                        $('.emp-list').append(temp)
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
  

  
  