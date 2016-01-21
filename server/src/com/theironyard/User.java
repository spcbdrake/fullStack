package com.theironyard;

/**
 * Created by Jack on 11/5/15.
 */
public class User {
    String userName;
    int id;
    String password;
    int money;

    public User() {

    }

    public User(String userName, int id, String password, int money) {
        this.userName = userName;
        this.id = id;
        this.password = password;
        this.money = money;
    }

    public String getUserName() {
        return userName;
    }

    public int getId() {
        return id;
    }

    public String getPassword() {
        return password;
    }

    public int getMoney() {
        return money;
    }
}