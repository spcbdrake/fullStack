package com.theironyard;

/**
 * Created by Jack on 11/5/15.
 */
public class User {
    int id;
    String password;
    int money;

    public User() {

    }

    public User(int id, String password, int money) {
        this.id = id;
        this.password = password;
        this.money = money;
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