db.summary.find(
    {
        $expr: {
            $gt: [
                "$dob.age",
                "$registered.age"
            ]
        }
    }
)

// If else condition
// if age>40 then age = age-40, else - age 
db.summary.find(
    {
        $expr: {
            $gt: [
                {
                    $cond: {
                        if: {
                            $gt: [
                                "$dob.age", 40
                            ]
                        },
                        then: {
                            $subtract: [
                                "$dob.age", 40
                            ]
                        },
                        else: "$dob.age"
                    }
                },
                "$registered.age"
            ]
        }
    }
)

// aggregation
// $match
db.summary.aggregate([
    { $match: { gender: "female" } },
    { $project: { gender: 1, name: 1, _id: 0 } }
])

// $group
// count of female
db.summary.aggregate([
    { $match: { gender: "female" } },
    {
        $group: {
            _id: { gender: "female" },
            totalCountBasedOnGender: { $sum: 1 }
        }
    }
])

// count of male
db.summary.aggregate([
    { $match: { gender: "male" } },
    {
        $group: {
            _id: { gender: "male" },
            totalCountBasedOnGender: { $sum: 1 }
        }
    }
])

// number of male and female
db.summary.aggregate([
    {
        $group: {
            _id: { gender_001: "$gender" },
            totalCountBasedOnGender: { $sum: 1 }
        }
    }
])

// male count per state
db.summary.aggregate([
    { $match: { gender: "male" } },
    {
        $group: {
            _id: {
                state: "$location.state"
            },
            totalMalePlayers: { $sum: 1 }
        }
    }
])

// male count per state in Ascending Order
db.summary.aggregate([
    { $match: { gender: "male" } },
    {
        $group: {
            _id: { state: "$location.state" },
            totalMalePlayers: { $sum: 1 }
        }
    },
    {
        $sort: {
            totalMalePlayers: -1
        }
    }
])

// concatenation with projection
db.summary.aggregate([
    { $match: { gender: "female" } },
    {
        $project: {
            _id: 0, gender: 1,
            fullName: {
                $concat: [
                    "$name.title", ".",
                    "$name.first", " ",
                    "$name.last"
                ]
            }}}
])

// concatenation with projection
db.summary.aggregate([
    { $match: { gender: "female" } },
    {
        $project: {
            _id: 0, gender: 1,
            fullName: {
                $concat: [
                    {$toUpper:"$name.title"}, ".",
                    {$toUpper:"$name.first"}, " ",
                    {$toUpper:"$name.last"}
                ]
            }}}
])