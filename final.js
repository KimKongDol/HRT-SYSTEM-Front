let state_text = ""//상태 표시를 읽어와서 명령시 상태를 파악
const myUrl = 'http://192.168.0.53/api/v2.0.0';
const myAutor = 'Basic ZGlzdHJpYnV0b3I6NjJmMmYwZjFlZmYxMGQzMTUyYzk1ZjZmMDU5NjU3NmU0ODJiYjhlNDQ4MDY0MzNmNGNmOTI5NzkyODM0YjAxNA==';

//테이블 생성
document.addEventListener('DOMContentLoaded', () => {
    for (let i = 0; i < 22; i++) { //파일이 로드되는 순간  22개의 테이블 만들기
        const tr = document.createElement('tr')
        tr.innerHTML = `<td class="uppercase" id="other_status_title${i}"></td>
        <td id="other_status_body${i}"></td>`
        document.querySelector('.status-table').appendChild(tr);
    }

    //상태정보를 읽어오는 함수시작
    function showStatusFunc() {
        const robotName = document.querySelector('#robotName')
        const mission = document.querySelector('#mission')
        const battery = document.querySelector('#battery')
        const mission_text = document.querySelector('#mission_text')
        const serial_number = document.querySelector('#serial_number')
        const errors = document.querySelector('#errors')

        var config = {
            method: 'get',
            url: `${myUrl}/status`,
            mode: 'no-cors',
            headers: {
                'Authorization': `${myAutor}`,
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                Accept: 'application/json',

            },
            withCredentials: true,
            credentials: 'same-origin',
            crossdomain: true,
        };

        axios(config)
            .then(function (response) {
                let status_num = Object.keys(response.data).length
                const status_array = Object.entries(response.data)
                const left_status_array = [];

                for (let i = 0; i < status_num; i++) {
                    const title = status_array[i][0];
                    if (title !== 'robot_model' && title !== 'state_text' && title !== 'battery_percentage' && title !== 'mission_text' && title !== 'serial_number' && title !== 'errors') {
                        left_status_array.push(status_array[i])
                    }
                }

                status_option.textContent = `그 외의 옵션 ${status_num - 6}가지`
                document.querySelector("#offcanvasLabel").innerHTML = `${status_num - 6}가지의 추가 정보`

                let error_occured = 0;
                for (const i in status_array) {
                    if (status_array[i][0] == 'errors') {
                        if (Object.keys(status_array[i][1]).length === 0) {
                            errors.innerHTML = '에러없음';
                            error_occured = 0;
                        } else {
                            error_occured = 1;
                            const errors_object_inArray = status_array[i][1];
                            const occured_error_num = errors_object_inArray.length; //발생한 에러 수                
                            for (let i = 0; i < occured_error_num; i++) {
                                const a = errors_object_inArray[i]
                                errors.innerHTML = `<strong>에러코드:</strong> ${a.code}<strong><br>모듈</strong>: ${a.module}`
                            }
                        }
                    }

                    switch (status_array[i][0]) {
                        case 'robot_model':
                            robotName.innerHTML = `${status_array[i][1]}`;
                            break
                        case 'state_text':
                            mission.innerHTML = `${status_array[i][1]}`;
                            state_text = mission.innerHTML;
                            break
                        case 'battery_percentage':
                            battery.innerHTML = `${status_array[i][1].toFixed(2)}%`;
                            document.querySelector(".battery-progress").style.width = `${status_array[i][1].toFixed(2)}%`
                            break
                        case 'mission_text':
                            if (error_occured == 0) {
                                mission_text.innerHTML = `${status_array[i][1]}`;
                            } else {
                                mission_text.innerHTML = `<i class="bi bi-exclamation-triangle-fill" style="color:red"></i> 에러 발생`;
                                mission_text.style.color = 'red';
                                errors.innerHTML += `<br><strong>에러 설명</strong>: ${status_array[i][1]}`;
                            }
                            break;
                        case 'serial_number':
                            serial_number.innerHTML = `${status_array[i][1]}`;
                            break;
                    }
                }

                for (const i in left_status_array) {
                    if (i != left_status_array.length - 1) {
                        document.querySelector(`#other_status_title${i}`).innerHTML = left_status_array[i][0];
                        document.querySelector(`#other_status_body${i}`).innerHTML = left_status_array[i][1];
                    } else {
                        document.querySelector(`#other_status_title${i}`).innerHTML = left_status_array[i][0];

                        // status의 마지막 정보는 위치객체(정보가 여러개의 테이블 형식으로 존재)이므로 다르게 전개
                        const position_object = left_status_array[i][1]
                        document.querySelector(`#other_status_body${i}`).innerHTML = `<strong>x:</strong> ${position_object.x}<br/> <strong>y:</strong> ${position_object.y}<br/><strong>orientation:</strong> ${position_object.orientation}`;
                    }
                }
            })
            .catch(function (error) {
                console.log(error);
            });
    }
    setInterval(showStatusFunc, 100) //0.1초마다 상태정보 변경
    //상태정보를 읽어오는 함수 끝
})

// 실행과 중지에 대한 함수 시작
function run_and_pause_btn(state_id) {
    var data = JSON.stringify({
        "state_id": state_id
    });

    var config = {
        method: 'put',
        url: `${myUrl}/status`,
        headers: {
            'Authorization': `${myAutor}`,
            'Content-Type': 'application/json',
        },
        data: data
    };

    axios(config)
        .then(function (response) {
        })
        .catch(function (error) {
            console.log(error);
        });
}
// 실행과 중지에 대한 함수 끝

// 실행과 중지에 대한 메세지 시작
var alertPlaceholder = document.getElementById('liveAlertPlaceholder')
function alert(message, type) {
    var wrapper = document.createElement('div')
    message = `${message}되었습니다.<br/>상태변경은 최대 3초가 소요될 수 있습니다.<br/> 좌측 '상태정보'의 상태(STATE TEXT)를 확인해주세요`
    wrapper.innerHTML = ` <div class="alert alert-${type}  alert-dismissible" role="alert">${message}</div>`
    alertPlaceholder.append(wrapper)
    setTimeout(function () { wrapper.remove() }, 1700);
}
// 실행과 중지에 대한 메세지 끝


//// 명령 수행에 대한 박스 시작
//명령 미션을 받아와서 읽는 함수 시작
function mission_list() {
    var config = {
        method: 'get',
        url: `${myUrl}/missions`,
        headers: {
            'Authorization': `${myAutor}`,
            'Content-Type': 'application/json',
        },
    };
    axios(config)
        .then(function (response) {
            let mission_num = Object.keys(response.data).length //모든 미션 수
            document.querySelector(".mission_info").innerHTML = `현재 수행가능한 미션은 <bold>${mission_num}가지</bold>입니다.`
            // console.log(`모든 미션 수:${mission_num}`)
            // console.log(response.data[0].name)
            for (const i in response.data) {
                const option = document.createElement('option');
                option.value = `${response.data[i].guid}` //밸류에 미션 id뽑을 예정(string형)
                option.textContent = `${response.data[i].name}`
                document.querySelector('.form-select-mission').appendChild(option)
            }
        })
        .catch(function (error) {
            console.log(error);
        });
}
mission_list()
//명령 미션을 받아와서 읽는 함수 끝

let guid = "";
//선택한 명령어 정보읽어오는 함수 시작
function choosen_mission() {
    const sel = document.querySelector(".form-select-mission"); //명령어 셀렉 탭
    document.querySelector("#mission_name").innerHTML = `<mark>${sel.options[sel.selectedIndex].textContent}</mark>`;
    document.querySelector("#guid").innerHTML = `<mark>${sel.options[sel.selectedIndex].value}</mark>`;
    document.querySelector(".mission-vaildation").style.visibility = 'visible'
    guid = sel.options[sel.selectedIndex].value;
}
//선택한 명령어 정보읽어오는 함수 끝

//선택한 명령어 정보 확인 함수 시작
setTimeout(3000, () => {
    document.querySelector(".mission-vaildation").style.visibility = 'hidden'
})//선택한 명령어 정보 확인 함수 끝

//선택한 명령어 수행 함수 시작
function carry_mission() {
    if (state_text !== 'Ready') {
        const error = document.querySelector('.mission-error');
        error.innerHTML = `<i class="bi bi-exclamation-triangle" style="color:red"></i>현재 로봇의 상태는 ${state_text}입니다.<br>Ready로 바꿔주세요.`
        error.style.color = 'red';
        error.style.padding = '0';
        setTimeout(() => {
            error.innerHTML = ''
        }, 5000)
    } else {
        var data = JSON.stringify({
            "mission_id": guid
        });

        var config = {
            method: 'post',
            url: `${myUrl}/mission_queue`,
            headers: {
                'Authorization': `${myAutor}`,
                'Content-Type': 'application/json',
            },
            data: data
        };

        axios(config)
            .then(function (response) {
                console.log('미션이 정상적으로 수행됩니다.');
            })
            .catch(function (error) {
                console.log(error);
            });
    }
}
//선택한 명령어 수행 함수 끝
//// 명령 수행에 대한 박스 끝

////레지스터 관련 박스 시작
let register_label_arr = [];

//레지스터 정보 리스트를 읽어오는 함수 시작
function register_list() {
    var config = {
        method: 'get',
        url: `${myUrl}/registers/`,
        headers: {
            'Authorization': `${myAutor}`,
            'Content-Type': 'application/json',
        },
    };
    axios(config)
        .then(function (response) {
            let num = Object.keys(response.data).length
            // console.log(JSON.stringify(response.data));
            for (const i in response.data) {
                const option = document.createElement('option'); //옵션 생성하고
                option.value = `${parseInt(response.data[i].value)}`;//옵션 밸류에 레지스터 벨류값 
                option.id = response.data[i].id
                option.innerHTML = `레지스터${response.data[i].id}`
                if (response.data[i].label !== '') {
                    option.innerHTML += ` (라밸명: ${response.data[i].label})`
                }
                document.querySelector('.form-select-register').appendChild(option)
                register_label_arr[i] = response.data[i].label
            }
        })
        .catch(function (error) {
            console.log(error);
        });

}
register_list()
//레지스터 정보 리스트를 읽어오는 함수 끝

const value_input = document.querySelector("#register-value-input")
const label_input = document.querySelector("#register-label-input")
let final_register_label = ""
let final_register_value = ""
let final_register_id = ""

let selected_value;
let selected_label;

//선택된 레지스터 정보 읽어서 출력하는 함수 시작
function choosen_register() {
    // document.querySelector(".register-change-box").style.visibility = 'visible';
    document.querySelector('.register-card').style.visibility = 'visible';
    const sel = document.querySelector(".form-select-register");
    let i = sel.selectedIndex;
    selected_value = sel.options[i].value;
    selected_label = register_label_arr[i - 1]
    document.querySelector("#register-id").innerHTML = `id: ${sel.options[i].id}`;
    final_register_id = sel.options[i].id;
    document.querySelector("#register-value").innerHTML = `value: ${selected_value}`;
    if (selected_label == '') {
        document.querySelector("#register-label").innerHTML = `label: (비어있음)`;
    } else {
        document.querySelector("#register-label").innerHTML = `label: ${selected_label}`;
    }
    value_input.value = selected_value;
    label_input.value = selected_label;
    document.querySelector("#warningText").innerHTML = ''

}
//선택된 레지스터 정보 읽어서 출력하는 함수 시작

//클릭시 input box비우기 시작
value_input.addEventListener("click", () => {
    value_input.value = '';
})
label_input.addEventListener("click", () => {
    label_input.value = '';
})
//클릭시 input box비우기 끝

//입력한 밸류값으로 [변경될 레지스터 정보]를 계속변경하는 함수 시작
value_input.addEventListener("keyup", () => {
    let taken_val = Number(value_input.value);
    if (taken_val < 0 || isNaN(taken_val) || value_input.value == '') {
        document.querySelector("#register-value").innerHTML = `value: ${selected_value}`;
        document.querySelector("#warningText").innerHTML = '정수를 입력해야합니다.';
    } else {
        document.querySelector("#register-value").innerHTML = `value: ${value_input.value}`;
        document.querySelector("#warningText").innerHTML = '';
        final_register_value = value_input.value;
    }
})

label_input.addEventListener("keyup", () => {
    if (label_input.value == '') {
        document.querySelector("#register-label").innerHTML = `label: ${selected_label}`;
    } else {
        document.querySelector("#register-label").innerHTML = `label: ${label_input.value}`;
        final_register_label = label_input.value;
    }
})
//입력한 밸류값으로 [변경될 레지스터 정보]를 계속변경하는 함수 끝

//레지스터 최종 변경 함수 시작
function register_change_order() {
    if (final_register_value == '') {
        final_register_value = selected_value;
        console.log(final_register_value)
    }

    if (final_register_label == '') {
        final_register_label = selected_label;
        console.log(final_register_label)
    }

    var data = JSON.stringify({
        "id": Number(final_register_id),
        "value": Number(final_register_value),
        "label": `${final_register_label}`
    });

    var config = {
        method: 'put',
        url: `${myUrl}/${Number(final_register_id)}`,
        headers: {
            'Authorization': `${myAutor}`,
            'Content-Type': 'application/json',
        },
        data: data
    };

    axios(config)
        .then(function (response) {
            console.log('정상적으로 보내짐');
        })
        .catch(function (error) {
            console.log(error);
        });

    document.querySelector('.register-card').style.visibility = 'hidden'
}
//레지스터 최종 변경 함수 끝

//레지스터 변경 후 메세지띄우는 함수 시작
function regiAlert() {
    const success = document.createElement('div');
    success.innerHTML = `<div class="alert alert-success regi-msg" role="alert">
    성공적으로 변경되었습니다.<br>id: ${final_register_id}<br>value: ${final_register_value}<br>label: ${final_register_label}</div>`
    document.querySelector('.regi-alert').appendChild(success);
    setTimeout(function () { success.remove() }, 5000);
}
//레지스터 변경 후 메세지띄우는 함수 끝
////레지스터 관련 박스 끝