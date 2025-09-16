const db = require('../config/db')

exports.allParents = async (req, res) => {


    try {

        const sql = `SELECT 
                   p.id,
                   p.name,
                   p.email,
                   p.phone_num,
                   p.img_src,
                   p.created_at AS Parent_Add,
                   st.stu_img,
                   st.stu_id,
                    st.section,
                   st.class,
                   st.created_at AS Student_Add,
                   u.firstname,
                   u.lastname
                   FROM parents_info p
                   LEFT JOIN students st ON p.user_id=st.stu_id
                   LEFT JOIN users u ON st.stu_id = u.id   
                   WHERE p.relation="Father"
        `
        const [result] = await db.query(sql)
        return res.status(200).json({ message: 'All parents fetched successfully !', success: true, data: result })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: 'Internal server error !', success: false })
    }
}

exports.speParentData = async (req, res) => {

    const { parentId } = req.params

    try {
        const sql = `SELECT 
                   p.id,
                   p.name,
                   p.email,
                   p.phone_num,
                   p.img_src,
                   p.created_at AS Parent_Add,
                   st.stu_img,
                   st.stu_id,
                   st.class,
                   st.section,
                   st.gender,
                   st.rollnum,
                   st.admissiondate,
                   st.admissionnum,
                   st.created_at AS Student_Add,
                   u.firstname,
                   u.lastname,
                   u.status
                   FROM parents_info p
                   LEFT JOIN students st ON p.user_id=st.stu_id
                   LEFT JOIN users u ON st.stu_id = u.id   
                   WHERE p.id= ? AND relation="Father"
        `
        const [result] = await db.query(sql ,[parentId])
         if(result.length===0){
             return res.status(200).json({ message: 'Parent Not Found!', success: false })
        }
        return res.status(200).json({ message: 'Parent fetched successfully !', success: true, data: result[0] })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: 'Internal server error !', success: false })
    }
}

// guardian data
exports.allGuardian = async (req, res) => {


    try {

        const sql = `SELECT 
                   p.id,
                   p.name,
                   p.email,
                   p.phone_num,
                   p.img_src,
                   p.created_at AS Gua_Add,
                   st.stu_img,
                   st.stu_id,
                    st.section,
                   st.class,
                   st.created_at AS Student_Add,
                   u.firstname,
                   u.lastname
                   FROM parents_info p
                   LEFT JOIN students st ON p.user_id=st.stu_id
                   LEFT JOIN users u ON st.stu_id = u.id   
                   WHERE p.relation="Guardian"
        `
        const [result] = await db.query(sql)
        return res.status(200).json({ message: 'All Guardian fetched successfully !', success: true, data: result })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: 'Internal server error !', success: false })
    }
}

exports.speGuardianData = async (req, res) => {

    const { guaId } = req.params

    try {
        const sql = `SELECT 
                   p.id,
                   p.name,
                   p.email,
                   p.phone_num,
                   p.img_src,
                   p.created_at AS Guardian_Add,
                   st.stu_img,
                   st.stu_id,
                   st.class,
                   st.section,
                   st.gender,
                   st.rollnum,
                   st.admissiondate,
                   st.admissionnum,
                   st.created_at AS Student_Add,
                   u.firstname,
                   u.lastname,
                   u.status
                   FROM parents_info p
                   LEFT JOIN students st ON p.user_id=st.stu_id
                   LEFT JOIN users u ON st.stu_id = u.id   
                   WHERE p.id=? AND p.relation="Guardian"
        `
        const [result] = await db.query(sql ,[guaId])
        if(result.length===0){
             return res.status(200).json({ message: 'Guardian Not Found!', success: false })
        }
        return res.status(200).json({ message: 'Guardian fetched successfully !', success: true, data: result[0] })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: 'Internal server error !', success: false })
    }
}