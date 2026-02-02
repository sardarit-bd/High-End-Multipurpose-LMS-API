import { Product } from "./product.model";
import AppError from "../../../errorHelpers/AppError";
import httpStatus from "http-status-codes";
import { Order } from "../../order/order.model";

const createProduct = async (payload: any) => {
  const exist = await Product.findOne({ slug: payload.slug });
  if (exist) throw new AppError(httpStatus.BAD_REQUEST, "Product slug already exists");
  return Product.create(payload);
};


const updateProduct = async (slug:string, payload: any) => {
  const exist = await Product.findOne({ slug: slug });
  if (!exist) throw new AppError(httpStatus.BAD_REQUEST, "Product does not exists");
  return Product.findOneAndUpdate({slug: slug}, payload);
};


const listProducts = async (query: any) => {
  const filter: any = {  };
  if (query.category) filter.category = query.category;
  if (query.q) filter["title"] = new RegExp(query.q, "i");

  const sort: any = {};
  if (query.sort === "price") sort.price = 1;
  else if (query.sort === "-price") sort.price = -1;
  else sort.createdAt = -1;

  return Product.find(filter).sort(sort).limit(Number(query.limit) || 50).populate("category");
};

const getProduct = async (slug: string) => {
  const product = await Product.findOne({ slug});
  if (!product) throw new AppError(httpStatus.NOT_FOUND, "Product not found");
  return product;
};


const getPurchasedProducts = async (userId: string) => {
  // Find all paid ecommerce orders for this user
  const orders = await Order.find({
    user: userId,
    status: "paid",
    itemType: "ecommerce",
    "ecommerce.items.0": { $exists: true } 
  }).populate({
    path: "ecommerce.items.product",
    model: Product,
    select: "title slug description images type price featuredImage digitalUrl isActive"
  });

  // Extract products from orders
  const purchasedProducts:any[] = [];
  const productMap = new Map();

  orders.forEach(order => {
    if (order.ecommerce?.items) {
      order.ecommerce.items.forEach((item: any) => {
        const productId = item.product._id.toString();
        
        // Skip if product already added
        if (productMap.has(productId)) return;

        const product = item.product;
        
        purchasedProducts.push({
          _id: product._id,
          title: product.title,
          slug: product.slug,
          description: product.description,
          images: product.images,
          type: product.type,
          price: product.price,
          featuredImage: product.featuredImage,
          digitalUrl: product.digitalUrl,
          isActive: product.isActive,
          purchaseInfo: {
            orderId: order._id,
            purchasedAt: order.createdAt,
            quantity: item.qty,
            unitPrice: item.unitPrice,
            totalPrice: item.qty * item.unitPrice,
            fulfillmentStatus: order.ecommerce?.fulfillment?.status || "unfulfilled"
          },
          canDownload: product.type === "digital" && product.digitalUrl,
          downloadUrl: product.type === "digital" ? product.digitalUrl : null
        });

        productMap.set(productId, true);
      });
    }
  });

  return purchasedProducts;
};
export const ProductServices = { createProduct, listProducts, getProduct, updateProduct, getPurchasedProducts };
