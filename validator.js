const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

function Validator(options){

    function getParent(element,selector){
        while (element.parentElement){
            if(element.parentElement.matches(selector)){
                return element.parentElement;
            }
            element = element.parentElement;
        }
    } 

    var selectorRules = {}

    function validate(inputElement,rule){
        var errorMessage;
        var errorElement = getParent(inputElement, options.formGroupSelector).querySelector(options.errorSelector)

        var rules = selectorRules[rule.selector]

        for(var i = 0;i < rules.length; ++i){

            switch(inputElement.type){
                case 'radio':
                case 'checkbox':
                    errorMessage = rules[i](formElement.querySelector(rule.selector+':checked'));
                    break;
                default:
                    errorMessage = rules[i](inputElement.value);
            }
            if(errorMessage)
            break;
        }


        if(errorMessage){
            getParent(inputElement, options.formGroupSelector).classList.add('invalid');
            errorElement.innerText = errorMessage;
        }else{
            getParent(inputElement, options.formGroupSelector).classList.remove('invalid')
            errorElement.innerText = '';
        }

        return !errorMessage;
    }

    var formElement = $(options.form);
    if(formElement){

        formElement.onsubmit = function(e){
            e.preventDefault();

            var isFormValid = true;

            options.rules.forEach(function (rule) {
                var inputElement = formElement.querySelector(rule.selector);
                var isValid = validate(inputElement,rule);
                if(!isValid){
                    isFormValid = false
                }
            })

            if(isFormValid){
                if(typeof options.onSubmit === 'function'){
                    var enableInputs = formElement.querySelectorAll('[name]');
                    var formValues = Array.from(enableInputs).reduce(function(values,input){
                        
                        switch(input.type){
                            case 'radio':
                                values[input.name] = formElement.querySelector('input[name="' + input.name + '"]:checked').value;
                                break;
                            case 'checkbox':
                                if (!input.matches(':checked')) {
                                    values[input.name] = '';
                                    return values;
                                }
                                if (!Array.isArray(values[input.name])) {
                                    values[input.name] = [];
                                }
                                values[input.name].push(input.value);
                                break;
                            case 'file':
                                values[input.name] = input.files;
                                break;
                            default:
                                values[input.name] = input.value;
                        }
                        
                        return values;
                    },{})
                    options.onSubmit(formValues);
                }
            }
        }

        options.rules.forEach(function(rule){

            if(Array.isArray(selectorRules[rule.selector])){
                selectorRules[rule.selector].push(rule.test)
            }else{
                selectorRules[rule.selector] = [rule.test]
            }

            var inputElements = formElement.querySelectorAll(rule.selector)

            Array.from(inputElements).forEach(function(inputElement){
                var errorElement = getParent(inputElement, options.formGroupSelector).querySelector(options.errorSelector)
                inputElement.onblur = function () {
                    validate(inputElement,rule);
                }
                inputElement.oninput = function(){
                    inputElement.parentElement.classList.remove('invalid');
                    errorElement.innerText = '';
                }
            })
        })
    }
}

Validator.isRequired = function(selector,message){
    return  {
        selector: selector,
        test: function(value){
            return value ? undefined : message || 'Vui lòng nhập dữ liệu' 
        }
    }
}

Validator.isEmail =  function(selector,message){
    return {
        selector: selector,
        test: function(value){
            var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
            return  regex.test(value) ? undefined : message || 'Vui lòng nhập Email'
        }
    }
}

Validator.minLength = function (selector,min) {
    return {
        selector: selector,
        test: function(value){
            return value.length >= 6 ? undefined : `Vui lòng nhập tối thiểu ${min} kí tự`
        }
    }
}

Validator.isConfirmed = function(selector,isConfirmValue,message){
    return{
        selector: selector,
        test: function(value){
            return value === isConfirmValue() ? undefined : message || 'Mật khẩu nhập lại không chính xác'
        }
    }
}