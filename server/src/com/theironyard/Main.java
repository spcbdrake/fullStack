package com.theironyard;

import jodd.json.JsonSerializer;
import spark.Session;
import spark.Spark;

import java.sql.*;
import java.util.ArrayList;

public class Main {
    public static final int START_MONEY = 100;


    public static void createTables(Connection conn) throws SQLException {
        Statement stmt = conn.createStatement();
        stmt.execute("CREATE TABLE IF NOT EXISTS users (id IDENTITY, userName VARCHAR, password VARCHAR, money INT)");
        stmt.execute("CREATE TABLE IF NOT EXISTS players (id IDENTITY, name VARCHAR, level INT)");
    }

    public static void insertUser(Connection conn, String userName, String password, int money) throws SQLException {
        PreparedStatement stmt = conn.prepareStatement("INSERT INTO users VALUES (NULL, ?, ?, ?)");
        stmt.setString(1, userName);
        stmt.setString(2, password);
        stmt.setInt(3, money);
        stmt.execute();
    }

    public static User selectUser(Connection conn, String userName) throws SQLException {
        User user = null;
        PreparedStatement stmt = conn.prepareStatement("SELECT * FROM users WHERE userName = ?");
        stmt.setString(1, userName);
        ResultSet results = stmt.executeQuery();
        if (results.next()) {
            user = new User();
            user.userName = results.getString("userName");
            user.id = results.getInt("id");
            user.password = results.getString("password");
            user.money = results.getInt("money");
        }
        return user;
    }

    public static void insertPlayer(Connection conn, String name, int level) throws SQLException {
        PreparedStatement stmt = conn.prepareStatement("INSERT INTO players VALUES (NULL, ?, ?)");
        stmt.setString(1, name);
        stmt.setInt(2, level);
        stmt.execute();
    }

    public static Player selectPlayer(Connection conn, int id) throws SQLException {
        Player player = null;
        PreparedStatement stmt = conn.prepareStatement("SELECT * FROM players WHERE players.id = ?");
        stmt.setInt(1, id);
        ResultSet results = stmt.executeQuery();
        if (results.next()) {
            player = new Player();
            player.id = results.getInt("id");
            player.name = results.getString("name");
            player.level = results.getInt("level");
        }
        return player;
    }

    public static ArrayList<Player> selectPlayers(Connection conn) throws SQLException {
        ArrayList<Player> players = new ArrayList<>();
        PreparedStatement stmt = conn.prepareStatement("SELECT * FROM players ORDER BY RAND() LIMIT 6");
        ResultSet results = stmt.executeQuery();
        while (results.next()) {
            Player player = new Player();
            player.id = results.getInt("id");
            player.name = results.getString("name");
            player.level = results.getInt("level");
            players.add(player);
        }
        return players;
    }

    public static ArrayList<User> selectUsers(Connection conn) throws SQLException {
        ArrayList<User> users = new ArrayList<>();
        PreparedStatement stmt = conn.prepareStatement("SELECT * FROM users");
        ResultSet results = stmt.executeQuery();
        while (results.next()) {
            User user = new User();
            user.userName = results.getString("userName");
            user.id = results.getInt("id");
            user.password = results.getString("password");
            user.money = results.getInt("money");
            users.add(user);
        }
        return users;
    }

    static void updateMoney (Connection conn, int id, int money) throws SQLException {
        PreparedStatement stmt = conn.prepareStatement("UPDATE users SET money = ? WHERE id = ?");
        stmt.setInt(1, money);
        stmt.setInt(2, id);
        stmt.execute();
    }

    public static ArrayList<User> orderUsers(Connection conn) throws SQLException {
        ArrayList<User> users = new ArrayList();
        PreparedStatement stmt = conn.prepareStatement("SELECT * FROM users ORDER BY money DESC");
        ResultSet results = stmt.executeQuery();
        while (results.next()) {
            User user = new User();
            user.userName = results.getString("userName");
            user.id = results.getInt("id");
            user.password = results.getString("password");
            user.money = results.getInt("money");
            users.add(user);
        }
        return users;
    }

    public static void main(String[] args) throws SQLException {
        Connection conn = DriverManager.getConnection("jdbc:h2:./main");
        createTables(conn);

        Spark.externalStaticFileLocation("client");
        Spark.init();

        if (selectUser(conn, "Jack") == null) {
            insertUser(conn, "Jack", "Jack", START_MONEY);
        }

        if (selectPlayers(conn).size() == 0){
            insertPlayer(conn, "Hilda Forehand", 1);
            insertPlayer(conn, "Karl Wolfschtagg", 2);
            insertPlayer(conn, "Ned Armstrong", 3);
            insertPlayer(conn, "Terry Patel", 4);
            insertPlayer(conn, "Kim Kim", 5);
            insertPlayer(conn, "Wolfgang Waltz", 1);
            insertPlayer(conn, "Gilbert Nardwar", 2);
            insertPlayer(conn, "Ed Kennedy", 3);
            insertPlayer(conn, "Charlotte Nougat", 4);
            insertPlayer(conn, "Dick Cumberbun", 5);
        }

        Spark.post(
                "/login",
                ((request, response) -> {
                    String userName = request.queryParams("userName");
                    String password = request.queryParams("password");

                    if (userName.isEmpty() || password.isEmpty()) {
                        return (403);
                    }

                    User user = selectUser(conn, userName);
                    if (user == null) {
                        insertUser(conn, userName, password, START_MONEY);
                    }
                    else if (!password.equals(user.password)) {
                        return (403);
                    }

                    Session session = request.session();
                    session.attribute("userName", userName);

                    JsonSerializer serializer = new JsonSerializer();
                    String json = serializer.serialize(selectUser(conn, userName));
                    return json;
                })
        );

        Spark.post(
                "/logout",
                ((request, response) -> {
                    Session session = request.session();
                    session.invalidate();
                    return "Logged Out";
                })
        );

        Spark.get(
                "/matches",
                ((request, response) -> {
                    JsonSerializer serializer = new JsonSerializer();
                    return serializer.serialize(selectPlayers(conn));
                })
        );

        Spark.post(
                "/update-money",
                ((request, response) -> {
                    Session session = request.session();
                    String userName = session.attribute("userName");

                    String money = request.queryParams("money");

                    try {
                        int newMoney = Integer.valueOf(money);
                        User me = selectUser(conn, userName);
                        updateMoney(conn, me.id, newMoney);
                    } catch (Exception e) {
                    }

                    JsonSerializer serializer = new JsonSerializer();
                    String json = serializer.serialize(selectUser(conn, userName));
                    return json;
                })
        );

        Spark.get(
                "/topTen",
                ((request, response) -> {
                    JsonSerializer serializer = new JsonSerializer();
                    return serializer.serialize(orderUsers(conn));
                })
        );
    }
}