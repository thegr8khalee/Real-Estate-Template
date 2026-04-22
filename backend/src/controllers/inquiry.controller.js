import Inquiry from '../models/inquiry.model.js';
import Property from '../models/property.model.js';
import User from '../models/user.model.js';

export const submitInquiry = async (req, res) => {
  try {
    const { propertyId, name, email, phone, type, preferredDate, preferredTime, message } = req.body;

    if (!propertyId || !name || !email) {
      return res.status(400).json({ success: false, message: 'Property, name, and email are required' });
    }

    const property = await Property.findByPk(propertyId);
    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    const inquiry = await Inquiry.create({
      propertyId,
      userId: req.user?.id || null,
      name,
      email,
      phone: phone || null,
      type: type || 'tour',
      preferredDate: preferredDate || null,
      preferredTime: preferredTime || null,
      message: message || null,
    });

    res.status(201).json({ success: true, inquiry, message: 'Inquiry submitted successfully' });
  } catch (error) {
    console.error('Error in submitInquiry:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

export const getInquiries = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const offset = (page - 1) * limit;
    const { status, type } = req.query;

    const where = {};
    if (status) where.status = status;
    if (type) where.type = type;

    const { count, rows } = await Inquiry.findAndCountAll({
      where,
      include: [
        { model: Property, as: 'property', attributes: ['id', 'title', 'images'] },
        { model: User, as: 'user', attributes: ['id', 'username', 'email'] },
      ],
      limit,
      offset,
      order: [['createdAt', 'DESC']],
    });

    res.status(200).json({
      success: true,
      totalItems: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      inquiries: rows,
    });
  } catch (error) {
    console.error('Error in getInquiries:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

export const updateInquiryStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNotes } = req.body;

    const validStatuses = ['pending', 'contacted', 'scheduled', 'completed', 'cancelled'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    }

    const inquiry = await Inquiry.findByPk(id);
    if (!inquiry) {
      return res.status(404).json({ success: false, message: 'Inquiry not found' });
    }

    if (status) inquiry.status = status;
    if (adminNotes !== undefined) inquiry.adminNotes = adminNotes;
    await inquiry.save();

    res.status(200).json({ success: true, inquiry, message: 'Inquiry updated successfully' });
  } catch (error) {
    console.error('Error in updateInquiryStatus:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

export const deleteInquiry = async (req, res) => {
  try {
    const { id } = req.params;

    const inquiry = await Inquiry.findByPk(id);
    if (!inquiry) {
      return res.status(404).json({ success: false, message: 'Inquiry not found' });
    }

    await inquiry.destroy();
    res.status(200).json({ success: true, message: 'Inquiry deleted successfully' });
  } catch (error) {
    console.error('Error in deleteInquiry:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};
