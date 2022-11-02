def fun1_1():print("fun1_1")
def fun1_2():print("fun1_2")
def fun1_3():print("fun1_3")

def fun1(sub_case):
    sub_switch = {
        1: fun1_1,
        2: fun1_2,
        3: fun1_3
    }
    sub_switch.get(sub_case, default_case)()
    return

def fun2_1(a):print("fun2_1")
def fun2_2(a):print("fun2_2")
def fun2_3(a):print(a)

def fun2(sub_case):
    sub_switch = {
        1: fun2_1,
        2: fun2_2,
        3: fun2_3
    }
    sub_switch.get(sub_case)(7)
    return

def fun3_1():print("fun3_1")
def fun3_2():print("fun3_2")
def fun3_3():print("fun3_3")

def fun3(sub_case):
    sub_switch = {
        1: fun3_1,
        2: fun3_2,
        3: fun3_3
    }
    sub_switch.get(sub_case, default_case)(7)
    return

def default_case(): print("Unsupported case!")

main_switch = {
    1: fun1,
    2: fun2,
    3: fun3
}


if __name__ == "__main__":
    main_case = 2
    sub_case = 3
    main_switch.get(main_case)(sub_case)
