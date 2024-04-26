//import android.view.LayoutInflater;
//import android.view.View;
//import android.view.ViewGroup;
//import android.widget.TextView;
//
//import androidx.annotation.NonNull;
//import androidx.recyclerview.widget.RecyclerView;
//
//import com.example.scrollrackmobile.R;
//
//import java.util.List;
//
//public class MyAdapter extends RecyclerView.Adapter<MyAdapter.ViewHolder> {
//
//    private List<String> mData; // Change this type according to your data model
//
//    public MyAdapter(List<String> data) {
//        this.mData = data;
//    }
//
//    @NonNull
//    @Override
//    public ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
//        View view = LayoutInflater.from(parent.getContext()).inflate(R.layout.list_items, parent, false);
//        return new ViewHolder(view);
//    }
//
//    @Override
//    public void onBindViewHolder(@NonNull ViewHolder holder, int position) {
//        String item = mData.get(position);
//        holder.textViewCardName.setText(item);
//    }
//
//    @Override
//    public int getItemCount() {
//        return mData.size();
//    }
//
//    public static class ViewHolder extends RecyclerView.ViewHolder {
//        TextView textViewCardName;
//
//        public ViewHolder(@NonNull View itemView) {
//            super(itemView);
//            textViewCardName = itemView.findViewById(R.id.textViewCardName);
//        }
//    }
//}
