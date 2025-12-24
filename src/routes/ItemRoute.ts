import { Router } from 'express';
import { add, update, getAllItem, remove, getItem } from '../controllers/ItemsController';

const router: Router = Router();

router.post('/', add);
router.get('/', getAllItem);
router.get('/:id', getItem);
router.put('/:id', update);
router.delete('/:id', remove);

export default router;
