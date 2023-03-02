const database = include('databaseConnection');

async function createUser(postData) {
    let createUserSQL = `
		INSERT INTO user
		(username, email, password)
		VALUES(:user, :email, :passwordHash);
	`;

    let params = {
        user: postData.user,
        email: postData.email,
        passwordHash: postData.hashedPassword
    }

    try {
        const results = await database.query(createUserSQL, params);

        console.log("Successfully created user");
        console.log(results[0]);
        return true;
    } catch (err) {
        console.log("Error inserting user");
        console.log(err);
        return false;
    }
}

async function getUsers(postData) {
    let getUsersSQL = `
        SELECT user_id, username, email, password, type
		FROM user
		JOIN user_type USING (user_type_id)
		WHERE email = :email;
	`;

    let params = {
        email: postData.email,
    }

    try {
        const results = await database.query(getUsersSQL, params);

        console.log("Successfully retrieved users");
        console.log(results[0]);
        return results[0];
    } catch (err) {
        console.log("Error getting users");
        console.log(err);
        return false;
    }
}

async function getUserById(postData) {
    let getUsersSQL = `
        SELECT user_id, username, email, password, type
		FROM user
		JOIN user_type USING (user_type_id)
		WHERE user_id = :id;
	`;

    let params = {
        id: postData.id,
    }

    try {
        const results = await database.query(getUsersSQL, params);

        console.log("Successfully retrieved users");
        console.log(results[0]);
        return results[0];
    } catch (err) {
        console.log("Error getting users");
        console.log(err);
        return false;
    }
}

async function getAllUsers() {
    let allUsersSQL = `
        SELECT user_id, username, email, password, type
        FROM user
        JOIN user_type USING (user_type_id)
        WHERE type = "user";
    `
    try {
        const results = await database.query(allUsersSQL);

        console.log("Successfully retrieved users");
        console.log(results[0]);
        return results[0];
    } catch (err) {
        console.log("Error getting users");
        console.log(err);
        return false;
    }
}

module.exports = { createUser, getUsers, getUserById, getAllUsers };