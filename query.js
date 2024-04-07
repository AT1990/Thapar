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
                state_key_name: "$location.state"
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
    },
    {
        $limit: 1
    }
])

// 2nd max count
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
    },
    {
        $skip: 1
    },
    {
        $limit: 1
    }
])

// Groups based on state first and then gender
db.summary.aggregate([
    {
        $group: {
            _id: {
                state: "$location.state",
                gender: "$gender"
            },
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
            }
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
                    { $toUpper: "$name.title" }, ".",
                    { $toUpper: "$name.first" }, " ",
                    { $toUpper: "$name.last" }
                ]
            },
            loc: {
                cord: [
                    {
                        $convert: {
                            input: "$location.coordinates.latitude",
                            to: "double",
                            onError: 0.00,
                            onNull: 0.00
                        }
                    },
                    {
                        $convert: {
                            input: "$location.coordinates.longitude",
                            to: "double",
                            onError: 0.00,
                            onNull: 0.00
                        }
                    }
                ]
            }
        }
    }
])

// Title Case - name 
db.summary.aggregate([
    { $match: { gender: "female" } },
    {
        $project: {
            _id: 0, gender: 1,
            fullName: {
                $concat: [
                    {
                        $toUpper: {
                            $substrCP: [
                                "$name.title", 0, 1
                            ]
                        }
                    },
                    {
                        $substrCP: [
                            "$name.title", 1,
                            {
                                $subtract: [
                                    {
                                        $strLenCP: "$name.title"
                                    }, 1
                                ]
                            }
                        ]
                    }, ".",
                    {
                        $toUpper: {
                            $substrCP: [
                                "$name.first", 0, 1
                            ]
                        }
                    },
                    {
                        $substrCP: [
                            "$name.first", 1,
                            {
                                $subtract: [
                                    {
                                        $strLenCP: "$name.title"
                                    }, 1
                                ]
                            }
                        ]
                    }, " ",
                    {
                        $toUpper: {
                            $substrCP: [
                                "$name.last", 0, 1
                            ]
                        }
                    },
                    {
                        $substrCP: [
                            "$name.last", 1,
                            {
                                $subtract: [
                                    {
                                        $strLenCP: "$name.title"
                                    }, 1
                                ]
                            }
                        ]
                    }
                ]
            }
        }
    }
])

// Date Formatting
db.summary.aggregate([
    {
        $project: {
            _id: 0, gender: 1,
            formattedDOB: {
                $toDate: "$dob.date"
            },
            fullName: {
                $concat: [
                    { $toUpper: "$name.title" }, ".",
                    { $toUpper: "$name.first" }, " ",
                    { $toUpper: "$name.last" }
                ]
            },
        }
    },
    {
        $project: {
            fullName: 1,
            gender: 1,
            dob: {
                $dateToString: {
                    format: "%d-%m-%Y",
                    date: "$formattedDOB"
                }
            }
        }
    }
])

// Array Operations
// $
db.interns.updateOne(
    { _id: 3, marks: 60 },
    {
        $set: {
            "marks.$": 80
        }
    }
)

// $[] -- to update all elements of an array
db.interns.updateOne(
    { _id: 2 },
    {
        $inc: {
            "marks.$[]": 5
        }
    }
)

//update on a specific index -- arrayName.index
db.interns.updateOne(
    { _id: 2 },
    {
        $set: {
            "marks.2": 5
        }
    }
)

// $push -- to push values to an array
db.interns.updateOne(
    { _id: 2 },
    {
        $push: {
            "marks": 91
        }
    }
)

//$ push with each to push multiple values in an array
db.interns.updateOne(
    { _id: 2 },
    {
        $push: {
            "marks": {
                $each: [91, 92]
            }
        }
    }
)

//$ push with each to push multiple values in an array with a given postion
db.interns.updateOne(
    { _id: 3 },
    {
        $push: {
            "marks": {
                $each: [91, 92],
                $position: 0
            }
        }
    }
)

// $slice -- to slice an array to a specified size, with +ve and -ve values
db.interns.updateOne(
    { _id: 3 },
    {
        $push: {
            "marks": {
                $each: [66, 60],
                $position: 0,
                $slice: -5
            }
        }
    }
)

// $pop with -1 and +1
db.interns.updateOne(
    { _id: 3 },
    {
        $pop: {
            "marks": -1
        }
    }
)

// $pull -- to remove values based on a condition
db.interns.updateOne(
    { _id: 2 },
    {
        $pull: {
            marks: {
                $gt: 89
            }
        }
    }
)

//$pullAll - to remove all occurances of a matching criteria
db.interns.updateOne(
    { _id: 3 },
    {
        $pullAll: {
            marks: [50, 92]
        }
    }
)

// Aggregete on arrays
db.students.aggregate([
    {
        $group: {
            _id: {
                classes: "$class"
            },
            totalStudentsInClass: {
                $sum: 1
            }
        }
    }
])

// class wise all subjects with unwind
db.students.aggregate([
    { $unwind: "$subjects" },
    {
        $group: {
            _id: {
                classes: "$class"
            },
            allSubjects: {
                $addToSet: "$subjects"
            }
        }
    }
])

// $Slice with 1size
db.students.aggregate([
    {
        $project: {
            _id: 0,
            name: 1,
            subject: {
                $slice: ["$subjects", 1]
            }
        }
    }
])

// $Slice with 2nd item from array of size 1
db.students.aggregate([
    {
        $project: {
            _id: 0,
            name: 1,
            subject: {
                $slice: ["$subjects", 1, 1]
            }
        }
    }
])

// filter - to filter data from an array
db.students.aggregate([
    {
        $project: {
            _id: 0,
            name: 1,
            score: {
                $filter: {
                    input: "$marks",
                    as: "maxMarks",
                    cond: {
                        $gt: ["$$maxMarks.theory", 75]
                    }
                }
            }
        }
    }
])

// $bucket -- to divide data in self defined buckets
db.summary.aggregate([
    {
        $bucket: {
            groupBy: "$dob.age",
            boundaries: [0, 30, 40, 50, 60, 70, 80],
            output: {
                numberOfPersons: { $sum: 1 }
            }
        }
    }
])

// $bucket -- to divide data in self defined buckets
db.summary.aggregate([
    {
        $bucket: {
            groupBy: "$dob.age",
            boundaries: [0, 30, 40, 50, 60, 70, 80],
            output: {
                averageOfAges: { $avg: "$dob.age" }
            }
        }
    }
])

// $bucketAuto -- to divide data in self defined buckets
db.summary.aggregate([
    {
        $bucketAuto: {
            groupBy: "$dob.age",
            buckets: 3,
            output: {
                numberOfPersons: { $sum: 1 },
                averageOfAges: { $avg: "$dob.age" }
            }
        }
    }
])


//---Lookup or Join
db.users.aggregate([
    {
        $lookup: {
            from: "cart",
            localField: "email",
            foreignField: "email",
            as: "output" //array
        }
    },
    {
        $project: {
            _id: 0,
            name: 1,
            email: 1,
            ItemsInCart: {
                $slice: ["$output.items", 1]
            }
        }
    }
])

////ItemsInCart:"$output.items"
db.users.aggregate([
    {
        $lookup: {
            from: "cart",
            localField: "email",
            foreignField: "email",
            as: "output" //array
        }
    },
    {
        $project: {
            _id: 0,
            name: 1,
            email: 1,
            ProductInCart: {
                $slice: ["$output.items.product_id", 1]
            }
        }
    }
])

// Users and the prooducts they want to buy
db.users.aggregate([
    {
        $lookup: {
            from: "cart",
            localField: "email",
            foreignField: "email",
            as: "output" //array
        }
    },
    {
        $lookup: {
            from: "products",
            localField: "output.items.product_id",
            foreignField: "p_id",
            as: "Users_ProdcustInCart"
        }
    },
    {
        $project: {
            _id: 0,
            name: 1,
            "Users_ProdcustInCart.name": 1,
            "Users_ProdcustInCart.category": 1,
            "output.items.qty": 1
        }
    }
])

// $Regex
// starts with Apple
db.products.find({
    name: {
        $regex: "^Apple"
    }
})

//Ends with Strix
db.products.find({
    name: {
        $regex: "Strix$"
    }
})

// "iphone" in the  name -- options like "i"/m/x/s etc
db.products.find({
    name: {
        $regex: /iphone/, $options: "s"
    }
})

// patterns as variable
var pattern = "^E"

db.products.find({
    category: {
        $regex: pattern,
        $options: "i"
    }
})

// Schema Validation
db.createCollection("movies", {
    validator: {
        $jsonSchema: {
            bsonType: "object",
            required: ["title", "genre", "cast", "ratings"],
            properties: {
                title: {
                    bsonType: "string",
                    description: "mandatory title"
                },
                "genre": {
                    bsonType: "string",
                    description: "mandatory category"
                },
                "cast": {
                    bsonType: "string",
                    description: "mandatory cast"
                },
                "ratings": {
                    bsonType: "int",
                    minimum: 1,
                    maximum: 10,
                    description: "int and must be between 1 and 10"
                },
                "reviews": {
                    bsonType: "array",
                    description: "non mandatory review",
                    items: {
                        bsonType: "object",
                        properties: {
                            user: {
                                bsonType: "object",
                                description: "must be a user name"
                            },
                            desc: {
                                bsonType: "string",
                                description: "movie review description"
                            }
                        }
                    }
                }
            }
        }
    }
})

//map reduction -- Deprecated now
var mapFunction1 = function () {
    emit(this.cust_id, this.price);
};

var reductionFun1 = function (keyCustID, totalPrcies) {
    return Array.sum(totalPrcies)
}

db.mr_orders.mapReduce(mapFunction1, reductionFun1,
    {
        out: "map_reduce_demo"
    })

// aggragtor
db.mr_orders.aggregate([
    {
        $group:{
            _id:"$cust_id",
            value:{$sum:"$price"}
        }
    },
    {
        $out:"map_reduce_demo_Agg"
    }
])


// indexes
// to get indexes
db


