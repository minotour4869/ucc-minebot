use admin;
db.createUser(
    {
        user: "Minotour",
        pwd: "helloniig0Db",
        roles: [
            {
                role: "userAdminAnyDatabase",
                db: "admin",
            },
            "readWriteAnyDatabase"
        ]
    }
)