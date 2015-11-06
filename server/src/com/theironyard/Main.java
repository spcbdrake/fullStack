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
        stmt.execute("CREATE TABLE IF NOT EXISTS users (id IDENTITY, name VARCHAR, password VARCHAR, money INT)");
        stmt.execute("CREATE TABLE IF NOT EXISTS players (id IDENTITY, name VARCHAR, level INT)");
    }

    public static void insertUser(Connection conn, String username, String password, int money) throws SQLException {
        PreparedStatement stmt = conn.prepareStatement("INSERT INTO users VALUES (NULL, ?, ?, ?)");
        stmt.setString(1, username);
        stmt.setString(2, password);
        stmt.setInt(3, money);
        stmt.execute();
    }

    public static User selectUser(Connection conn, String username, int money) throws SQLException {
        User user = null;
        PreparedStatement stmt = conn.prepareStatement("SELECT * FROM users WHERE name = ?, money = ?");
        stmt.setString(1, username);
        stmt.setInt(2, money);
        ResultSet results = stmt.executeQuery();
        if (results.next()) {
            user = new User();
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



    public static void main(String[] args) throws SQLException {
        Connection conn = DriverManager.getConnection("jdbc:h2:./main");
        createTables(conn);

        Spark.externalStaticFileLocation("client");
        Spark.init();

        if (selectUser(conn, "Jack") == null) {
            insertUser(conn, "Jack", "Jack", 100);
        }

        if (selectPlayers(conn).size() == 0){
            insertPlayer(conn, "Jack", 100);
            insertPlayer(conn, "Ben", 9000);
            insertPlayer(conn, "Terry", 100);
            insertPlayer(conn, "Juan", 100);
            insertPlayer(conn, "Josh", 100);
            insertPlayer(conn, "Zach", 100);
            insertPlayer(conn, "Alice", 100);
            insertPlayer(conn, "Brian", 100);
            insertPlayer(conn, "Charlie", 100);
            insertPlayer(conn, "David", 100);
        }

        Spark.post(
                "/login",
                ((request, response) -> {
                    String username = request.queryParams("userName");
                    String password = request.queryParams("password");

                    if (username.isEmpty() || password.isEmpty()) {
                        Spark.halt(403);
                    }

                    User user = selectUser(conn, username);
                    if (user == null) {
                        insertUser(conn, username, password, START_MONEY);
                    }
                    else if (!password.equals(user.password)) {
                        Spark.halt(403);
                    }

                    Session session = request.session();
                    session.attribute("userName", username);

                    JsonSerializer serializer = new JsonSerializer();
                    String json = serializer.serialize(selectUser(conn, username));
                    return json;
                })
        );

     /*   Spark.post(
                "/logout",
                ((request, response) -> {
                    Session session = request.session();
                    session.invalidate();
                    return "";
                })
        );*/

        Spark.get(
                "/matches",
                ((request, response) -> {
                    JsonSerializer serializer = new JsonSerializer();
                    return serializer.serialize(selectPlayers(conn));
                })
        );
    }
}
