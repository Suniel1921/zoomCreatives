
// ******************showing client based data on the basis of super admin (this is also a normal user treat as for now) *************************


const upload = require('../config/multerConfig');
const ClientModel = require('../models/newModel/clientModel');
const bcrypt = require('bcryptjs'); 
const cloudinary = require ('cloudinary').v2;


//create client controller

// exports.addClient = [
//   upload.array('profilePhoto', 1),
//   async (req, res) => {
//     // const { superAdminId } = req.user; // Extract superAdminId from authenticated user
//     const { _id: superAdminId } = req.user; // Getting user ID from the authenticated user
//     if (!superAdminId) {
//       return res.status(403).json({ success: false, message: 'Unauthorized: SuperAdmin access required.' });
//     }

//     try {
//       const {
//         name,
//         category,
//         status,
//         email,
//         password,
//         phone,
//         nationality,
//         postalCode,
//         prefecture,
//         city,
//         street,
//         building,
//         modeOfContact,
//         socialMedia,
//         timeline,
//         dateJoined,
//       } = req.body;

//       const hashedPassword = await bcrypt.hash(password, 10);

//       if (!req.files || req.files.length === 0) {
//         return res.status(400).json({ success: false, message: 'No file uploaded' });
//       }

//       const profilePhotoUrls = [];
//       for (const file of req.files) {
//         const result = await cloudinary.uploader.upload(file.path);
//         profilePhotoUrls.push(result.secure_url);
//       }

//       const createClient = await ClientModel.create({
//         superAdminId,
//         name,
//         category,
//         status,
//         email,
//         password: hashedPassword,
//         phone,
//         nationality,
//         postalCode,
//         prefecture,
//         city,
//         street,
//         building,
//         modeOfContact,
//         socialMedia,
//         timeline,
//         dateJoined,
//         profilePhoto: profilePhotoUrls[0],
//       });

//       return res.status(201).json({ success: true, message: 'Client created successfully', createClient });
//     } catch (error) {
//       return res.status(500).json({ success: false, message: 'Internal Server Error', error });
//     }
//   },
// ];



const MAX_SIZE = 2 * 1024 * 1024; // 2MB

exports.addClient = [
  upload.array('profilePhoto', 1),
  async (req, res) => {
    const { _id: superAdminId } = req.user;

    if (!superAdminId) {
      return res.status(403).json({ success: false, message: 'Unauthorized: SuperAdmin access required.' });
    }

    try {
      const {
        name,
        category,
        status,
        email,
        password,
        phone,
        nationality,
        postalCode,
        prefecture,
        city,
        street,
        building,
        modeOfContact,
        socialMedia,
        timeline,
        dateJoined,
      } = req.body;

      const hashedPassword = await bcrypt.hash(password, 10);

      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ success: false, message: 'No file uploaded' });
      }

      const profilePhotoUrls = [];

      // Check file size for profile photo
      for (const file of req.files) {
        if (file.size > MAX_SIZE) {
          return res.status(400).json({ success: false, message: 'Profile photo must be less than 2MB.' });
        }
        
        const result = await cloudinary.uploader.upload(file.path);
        profilePhotoUrls.push(result.secure_url);
      }

      const createClient = await ClientModel.create({
        superAdminId,
        name,
        category,
        status,
        email,
        password: hashedPassword,
        phone,
        nationality,
        postalCode,
        prefecture,
        city,
        street,
        building,
        modeOfContact,
        socialMedia,
        timeline,
        dateJoined,
        profilePhoto: profilePhotoUrls[0],
      });

      return res.status(201).json({ success: true, message: 'Client created successfully', createClient });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Internal Server Error', error });
    }
  }
];



//get all clients controller
exports.getClients = async (req, res) => {
  const { _id: superAdminId } = req.user;  
  
  if (!superAdminId) {
    return res.status(403).json({ success: false, message: 'Unauthorized: SuperAdmin access required.' });
  }

  try {
    // Fetch clients where the superAdminId matches the logged-in user's superAdminId
    const clients = await ClientModel.find({ superAdminId }); 
    res.json({ success: true, clients });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


//get client by id controller
exports.getClientById = async (req, res) => {
  const { _id: superAdminId } = req.user;
  if (!superAdminId) {
    return res.status(403).json({ success: false, message: 'Unauthorized: SuperAdmin access required.' });
  }

  try {
    const client = await ClientModel.findById(req.params.id);
    if (!client) {
      return res.status(404).json({ success: false, message: 'Client not found.' });
    }
    res.json({ success: true, client });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};




//update client controller
exports.updateClient = async (req, res) => {
  const { _id: superAdminId } = req.user;
  if (!superAdminId) {
    return res.status(403).json({ success: false, message: 'Unauthorized: SuperAdmin access required.' });
  }

  try {
    const client = await ClientModel.findById(req.params.id);
    if (!client) {
      return res.status(404).json({ success: false, message: 'Client not found.' });
    }

    const {
      name,
      category,
      status,
      email,
      password,
      phone,
      nationality,
      postalCode,
      prefecture,
      city,
      street,
      building,
      modeOfContact,
      socialMedia,
    } = req.body;

    client.name = name || client.name;
    client.category = category || client.category;
    client.status = status || client.status;
    client.email = email || client.email;
    client.phone = phone || client.phone;
    client.nationality = nationality || client.nationality;
    client.postalCode = postalCode || client.postalCode;
    client.prefecture = prefecture || client.prefecture;
    client.city = city || client.city;
    client.street = street || client.street;
    client.building = building || client.building;
    client.modeOfContact = modeOfContact || client.modeOfContact;
    client.socialMedia = socialMedia || client.socialMedia;

    if (password) {
      client.password = await bcrypt.hash(password, 10); 
    }

    const updatedClient = await client.save();
    res.status(200).json({ success: true, message: 'Client updated successfully.', updatedClient });
  } catch (err) {
    res.status(400).json({ success: false, message: 'Error updating client. Please try again later.', error: err });
  }
};



//update client profile from client side


// exports.updateClientProfile = async (req, res) => {
//   try {
//     // Ensure the user exists (could also be checked in requireLogin if needed)
//     const userId = req.user.id;  // Get user ID from the token
//     const { fullName, email, phone } = req.body;  // Destructure data from the request body

//     // Find the user by ID and update
//     const updatedUser = await ClientModel.findByIdAndUpdate(
//       userId,
//       { fullName, email, phone },
//       { new: true }  // Return the updated document
//     );

//     // If user is not found
//     if (!updatedUser) {
//       return res.status(404).json({ message: 'User not found' });
//     }

//     // Respond with success and the updated user data
//     return res.status(200).json({
//       success: true,
//       message: 'Profile updated successfully',
//       updatedClient: updatedUser,
//     });
//   } catch (error) {
//     return res.status(500).json({ message: 'Error updating profile', error: error.message });
//   }
// };



// controllers/profileController.js
exports.updateClientProfile = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized. User not authenticated.' });
  }

  try {
    const userId = req.user.id; // Get user ID from the token
    const { fullName, email, phone } = req.body; // Destructure data from the request body

    const updatedUser = await ClientModel.findByIdAndUpdate(
      userId,
      { fullName, email, phone },
      { new: true } // Return the updated document
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      updatedClient: updatedUser,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error updating profile', error: error.message });
  }
};











//delete client controller
exports.deleteClient = async (req, res) => {
  const { _id: superAdminId } = req.user;
  if (!superAdminId) {
    return res.status(403).json({ success: false, message: 'Unauthorized: SuperAdmin access required.' });
  }

  try {
    const client = await ClientModel.findByIdAndDelete(req.params.id);
    if (!client) {
      return res.status(404).json({ success: false, message: 'Client not found.' });
    }
    res.status(200).json({ success: true, message: 'Client deleted successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal Server Error', error });
  }
};








