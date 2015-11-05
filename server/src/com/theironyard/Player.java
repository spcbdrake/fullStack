package com.theironyard;

/**
 * Created by Jack on 11/5/15.
 */
public class Player {
    int id;
    String name;
    int level;

    public Player() {

    }

    public Player(int id, String name, int level) {
        this.id = id;
        this.name = name;
        this.level = level;
    }

    public int getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public int getLevel() {
        return level;
    }
}
